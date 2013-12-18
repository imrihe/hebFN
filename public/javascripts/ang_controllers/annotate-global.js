function AnnotateCtrl($scope,utils )
{
    $scope.showHideID=function(id){
        var descDiv=$("#"+id);
        if(descDiv.is(":visible") )
        {
            descDiv.slideUp();
        }
        else
        {
            descDiv.slideDown();
        }
    };
    
    $scope.$watch( function() //on every digest
        {
            if($(".miniable:not(.processed)").length>0)
            {
                $(".miniable:not(.processed) .miniable-full").show();
                $(".miniable:not(.processed) .miniable-short").hide();

                $(".miniable.default-mini:not(.processed) .miniable-full").hide();
                $(".miniable.default-mini:not(.processed) .miniable-short").show();

                $(".compact .miniable:not(.processed) .miniable-full").hide();
                $(".compact .miniable:not(.processed) .miniable-short").show();
                
                var icon = $("<i class='icon-minus-sign clickable pull-right'></i>").click(function()
                    {
                        $(this).toggleClass("icon-plus-sign icon-minus-sign");
                        $(this.parentNode.getElementsByClassName("miniable-full")).slideToggle();
                        $(this.parentNode.getElementsByClassName("miniable-short")).slideToggle();
                    });
                
                $(".miniable:not(.processed)").prepend( icon );
                $(".compact .miniable:not(.processed) .icon-minus-sign").toggleClass("icon-plus-sign icon-minus-sign");
                $(".miniable.default-mini:not(.processed) .icon-minus-sign").toggleClass("icon-plus-sign icon-minus-sign");
                $(".miniable:not(.processed)").addClass("processed");
            }

        });
    $scope.constants={};    
    utils.CallServerGet("constants",
        {},
        function(out){
            $scope.constants={};
            for(var i =0;i<out.length;i++)
            {
                $scope.constants[out[i].name]=out[i];
            }
           
            $scope.$apply();});
    
}