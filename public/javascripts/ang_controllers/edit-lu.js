
function EditLuCtrl($scope, $routeParams,utils) {
    $scope.luPos=$routeParams.lupos;
    $scope.luName=$routeParams.luname;
    $scope.frameName=$routeParams.framename;
    
    $scope.selectedFrame={};
    $scope.selectedLU={};
    
    $scope.selectedFrame={};
    utils.CallServerGet("heb/framedata",
        {framename:$scope.frameName},
        function(out){
            $scope.selectedFrame=out;
            $scope.$apply();});
    
    $scope.selectedSemType="";
    $scope.semType="";
    $scope.luStatus="";
    
    $scope.luLemma="";

    $scope.luDefenition="";
    $scope.luIncoFe="";

    $scope.luComments = [];
    $scope.newComment = null;
    
    $scope.updateModels=function()
    {
        $scope.luStatus=$scope.selectedLU.status;
        $scope.luLemma=$scope.selectedLU['@lemma'];
        $scope.luIncoFe=$scope.selectedLU['@incorporatedFE'];
        $scope.luDefenition=$scope.selectedLU.definition;
	$scope.luComments = $scope.selectedLU.comments;
    };
    $scope.refreshPage=function()
    {
    utils.CallServerGet("heb/lu",
        {framename:$scope.frameName,luname:($scope.luName+"."+$routeParams.lupos)},
        function(out){
            if(out.semType!=undefined)
            {
                $scope.semType=out.semType.map(function(x){return x['@name'];}).join(", ");
            }
            $scope.selectedLU=out;
            $scope.updateModels();
            
            $scope.$apply();});
    }
    $scope.refreshPage();        
    
    $scope.isSemTypeValid =function()
    {
        return $scope.semType.match(/^[A-Za-z_ ,]*$/)===null;
    };
    $scope.addSelectedSemType =function()
    {
        if($scope.semType.trim()==="")
        {
            $scope.semType=$scope.selectedSemType;
        }
        else
        {
            $scope.semType+=", "+$scope.selectedSemType;
        }
    };
    $scope.getListOfFes=function()
    {
        if($scope.selectedFrame.engData!=undefined)
        { 
            return [""].concat($.map($scope.selectedFrame.engData.fes.core.concat($scope.selectedFrame.engData.fes.nonCore),function( val, i ) {return val.name}));
        }
        return [];
    };
    $scope.editLu=function()
    {
        var data=
            {
                framename:$scope.frameName,
                luname:$scope.luName+"."+$scope.luPos,
                definition:$scope.luDefenition,
                status:$scope.luStatus,
                lemma:$scope.luLemma,
                incoFe:$scope.luIncoFe,
            };
        var cleaned={};
        $.each( data, function( key, value ) {
            if(value!==undefined)
            {
                cleaned[key]=value;
            }
        });

        if($scope.semType.replace(/^[\s,]+|[\s,]+$/g, '')!=="")
        {
            cleaned.semType=$scope.semType.replace(/^[\s,]+|[\s,]+$/g, '').split(",").map(function(x){return x.trim();});
        }
        else
        {
            cleaned.semType="";
        }

        utils.CallServerPost("heb/editlu", cleaned,
            function(out){
                 $scope.refreshPage();  
                });
        
    };

    $scope.postComment = function(){
	var params = {
	    type: 'lu',
	    luname: $scope.selectedLU['@name'],
	    framename: $scope.frameName,
	    comment: $scope.newComment
	};
	$scope.newComment = null;
	utils.CallServerPost("heb/addcomment", params, function(res){
	    $scope.luComments.push(res);
	    $scope.$apply();
	});
    }

}
