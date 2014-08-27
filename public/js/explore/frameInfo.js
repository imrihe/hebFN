(function(){
    angular.module('hebFN.explore').
	directive('frameInfo', frameInfo);

    frameInfo.$inject = ['frameDataService'];

    function frameInfo(frameDataService) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    scope: {frameName: '='},
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl($scope){
	    var self = this;

	    this.frameName = $scope.frameName;
	    this.showFEs = false;
	    this.showRelations = false;

	    this.toggle = function(what) {
		self[what] = !self[what];
	    };

	    /// initialization ///
	    self.frame = frameDataService.getFrame(this.frameName);
	};
    }
})();
