(function(){
    angular.module('hebFN.explore').
	directive('frameInfo', frameInfo);

    frameInfo.$inject = ['$routeParams', '$location', 'frameDataService'];

    function frameInfo($routeParams, $location, frameDataService) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl(){
	    var self = this;

	    this.frameName = $routeParams.frame;
	    this.showFEs = false;
	    this.showRelations = false;

	    this.toggle = function(what) {
		self[what] = !self[what];
	    };

	    /// initialization ///
	    if (!this.frameName) {
		frameDataService.listFrames().then(function(response){
		    var name = response.data[0].frame['@name'];
		    $location.path(name);
		});
	    } else {
		self.frame = frameDataService.getFrame(this.frameName);
	    }
	};
    }
})();
