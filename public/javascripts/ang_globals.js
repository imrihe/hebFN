angular.module('utils',['ui.keypress','ngRoute'],function($provide) {

    /*var underscore = angular.module('underscore', []);
     underscore.factory('_', function() {
     return window._; // assumes underscore has already been loaded on the page
     });                                                                          */


    $provide.factory('utils', ['$http', function($http) {
        var UtilsServiceInstance={};
        UtilsServiceInstance.stripTags=function(str)
        {
            if(typeof str !== 'undefined')
            {
                return str.replace(/<(?:.|\n)*?>/gm, '');
            }
            else
            {
                return "";
            }
        };

        UtilsServiceInstance.shortendString=function(str,maxLen)
        {
            if(str.length>maxLen)
            {
                return str.substring(0,maxLen-3)+"...";
            }
            else
            {
                return str;
            }
        };
        UtilsServiceInstance.stripNonTagged=function(str)
        {
            if(typeof str !== 'undefined')
            {
                return str.replace(/^[^<]*/m, '');
            }
            else
            {
                return "";
            }
        };
        UtilsServiceInstance.HandleError=function(message,noServerLog/*=false*/,noUserNotification/*=false*/)
        {
            if(message===null)
            {
                return;
            }
            if(noServerLog===null)
            {
                noServerLog=false;
            }
            if(noUserNotification===null)
            {
                noUserNotification=false;
            }
            if(!noUserNotification)
            {
                $("#error-modal-msg").text(message);
                $("#error-modal").modal();
            }
        };
        var GetFunctionAddress=function(functionName)
        {
            //return  "http://www.cs.bgu.ac.il/~imrihe/nodeJS1/"+functionName;
            //return  "lab109f:3000/"+functionName;
            return functionName;


        };
        UtilsServiceInstance.CallServerPost=function (functionName,params,onSuccess)
        {
            var dict={type: "POST",dataType: "json"};
            dict.url= GetFunctionAddress(functionName);
            if(typeof params !== 'undefined')
            {
                dict.data= $.param(params);
            }
            $.ajax(dict)
                .done(function (response, textStatus, jqXHR)
                {
                    // asyncFunction($.parseJSON(response));
                    onSuccess(response);
                })
                .fail(function (response, textStatus, jqXHR)
                {
                    if(textStatus=="abort")
                    {
                        return;
                    }
                    UtilsServiceInstance.HandleError("Couldn't POST to "+functionName,false,false);
                });
        };
        UtilsServiceInstance.LoadResponseToDiv=function(id,functionName,params,onDone)
        {
            $("#"+id).fadeOut(200);
            setTimeout(function()
            {
                $("#"+id+"-loading").show();
                UtilsServiceInstance.CallServerGet(functionName,params,function(out){
                    onDone(out);
                    $("#"+id+"-loading").hide();
                    $("#"+id).fadeIn()});
            },200);
        };
        UtilsServiceInstance.CallServerGet=function (functionName,params,onSuccess)
        {

            var dict={type: "GET",dataType: "json"
                // url: "http://www.cs.bgu.ac.il/~imrihe/nodeJS1/"+functionName,
                //crossDomain: true,
            };

            dict.url= GetFunctionAddress(functionName);



            if(typeof params !== 'undefined')
            {
                dict.data= $.param(params);
            }




            return $.ajax(dict)
                .done(function (response, textStatus, jqXHR){
                    // asyncFunction($.parseJSON(response));
                    onSuccess(response);
                })
                .fail(function (response, textStatus, jqXHR){
                    if(textStatus=="abort")
                    {
                        return;
                    }
                    UtilsServiceInstance.HandleError("Couldn't GET to "+functionName,false,false);
                });

        };

        return UtilsServiceInstance;
    }
    ]);

});

