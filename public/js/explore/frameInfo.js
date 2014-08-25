(function(){
    angular.module('hebFN.explore').
	directive('frameInfo', frameInfo);

    frameInfo.$inject = ['$routeParams', '$location', 'frameDataManager'];

    function frameInfo($routeParams, $location, frameDataManager) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl(){
	    var infoCtrl = this;

	    this.frameName = $routeParams.frame;
	    this.info = {};
	    this.showFEs = false;
	    this.showRelations = false;

	    this.toggle = function(what) {
		infoCtrl[what] = !infoCtrl[what];
	    };

	    /// initialization ///
	    if (!this.frameName) {
		frameDataManager.listFrames().then(function(response){
		    var name = response.data[0].frame['@name'];
		    $location.path(name);
		});
	    } else {
		frameDataManager.frameData(this.frameName).then(function(response){
		    infoCtrl.info = response.data;
		});
	    }
	};
    }
})();
