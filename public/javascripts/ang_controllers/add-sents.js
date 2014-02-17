
function AddSentsCtrl($scope, $routeParams,utils) {
    $scope.selectedLUName=$routeParams.luname;
    $scope.selectedLUShortName =$scope.selectedLUName.split(".")[0];
    $scope.selectedLUShortPos =$scope.selectedLUName.split(".")[1];
    
    $scope.selectedFrameName=$routeParams.framename;
    $scope.currentSentences=[];
    $scope.foundSentences=[];
    $scope.updateCurrentSents=function()
    {
        utils.CallServerGet("heb/lusentence",
            {
                framename:$scope.selectedFrameName,
                luname:$scope.selectedLUName
            },
            function(out){
                $scope.currentSentences=out;
                $scope.$apply();}
            );
    };
    $scope.updateCurrentSents();
    
    
    utils.CallServerGet("external/exampleSentences",{lupos:$scope.selectedLUShortPos,luname:$scope.selectedLUShortName},function(out)
    {
        $scope.foundSentences=out;
        $scope.$apply(); 
    });
    
    
}
