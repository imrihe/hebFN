function FramesIdxCtrl($scope, $routeParams,$location,utils ) {

    $scope.frames=[];
    $scope.filteredFrames=[];

    document.title = 'HebFN';
    
    
    $scope.query="";
    if($routeParams.hasOwnProperty("search"))
    {
        $scope.query=$routeParams.search;
    }
    $scope.currentPage = 0;
    $scope.pageSize = 30;
    
    $scope.updateFilteredFrames=function()
    {
        var newList=[];
        if($scope.frames instanceof Array )
        {
            for(var i =0;i<$scope.frames.length;i++)
            {
                if ($scope.frames[i].frame['@name'].toLowerCase().indexOf($scope.query.toLowerCase())!==-1)
                {
                    newList.push($scope.frames[i]);
                }
            }
        }
        $scope.filteredFrames=newList;
        var numOfPages=$scope.numberOfPages();
        if($scope.currentPage>numOfPages)
        {
            $scope.currentPage=numOfPages-1;
        }
        
    };
    
    $scope.$watch('query', function(newValue, oldValue) {$scope.updateFilteredFrames();$location.search('search',newValue);});
    $scope.$watch('frames', function(newValue, oldValue) {$scope.updateFilteredFrames();});
   
    utils.CallServerGet("eng/framenames",{},function(out)
        {
            $scope.frames=out;
            if($routeParams.hasOwnProperty("frame"))
            {
                $scope.chooseFrame($routeParams.frame);
            }
            else
            {
                $scope.chooseFrame($scope.frames[0].frame['@name']  );
            }

            $scope.$apply();
        });
    

    $scope.selectedFrame=[];
    $scope.chooseFrame=function(name)
    {
	$location.search('frame',name);
    };

    var oldFrame = null;
    var isValidFrameName = function(n) {
	return typeof(n) === typeof("") && n.length > 0;
    }

    var getFrame = function(name){
	if (oldFrame !== name && isValidFrameName(name)) {
	    oldFrame = name;
	    utils.LoadResponseToDiv(
		"selected-frame-info",
		"heb/framedata",
		{framename:name},
		function(out){
                    $scope.selectedFrame=out;
                    $scope.$apply();
		});	
	}
    }
    
    $scope.$on('$routeUpdate', function(e, s){
	var name = s.params.frame;
        getFrame(name);
    });

    $(document).ready(function(){
	getFrame($location.search()['frame']);
    });

    

    $scope.shortendString=utils.shortendString;
    
    //$scope.stripTags=utils.stripTags;
  
    /*$scope.nameFilter=function(item){
        if($scope.query==="")
        {
            return true;
        }
        if( (typeof item !== 'undefined') &&
            (item.hasOwnProperty('frame')) &&
            (item.frame.hasOwnProperty('@name') ))
            {
            return item.frame['@name'].toLowerCase().indexOf($scope.query.toLowerCase())!=-1;
            }
        return false;
    };*/
    
    
    
    
    
    $scope.numberOfPages=function(){
        if($scope.filteredFrames instanceof Array)
        {
            if($scope.filteredFrames.length===0)
            {
                return 1;
            }
            return Math.ceil($scope.filteredFrames.length/$scope.pageSize);    
        }
        else
        {
            return 1;
        }
    };

    $scope.getFERealtions= function(fe){
        var fes = $scope.selectedFrame.engData.frame.FE;
        var feRel = {ex: null, req: null, semType: null};
        for (feObj in fes){
            if (fes[feObj]['@name'] == fe){
                feRel.ex =  fes[feObj]['excludesFE']
                feRel.req = fes[feObj]['requiresFE']
                feRel.semType =fes[feObj]['semType']
                break;
            }

        }
        return feRel;
    }

}
