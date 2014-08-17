(function(){
    angular.module('fnExplore').
	directive('frameInfo', frameInfo);

    frameInfo.$inject = ['$routeParams',  'frameDataManager'];

    function frameInfo($routeParams, frameDataManager) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl(){
	    var infoCtrl = this;

	    this.info = {};
	    this.showFEs = false;
	    this.showRelations = false;

	    activate();

	    this.toggle = function(what) {
		infoCtrl[what] = !infoCtrl[what];
	    };

	    /// initialization ///
	    function activate(){
		frameDataManager.listFrames().then(function(response){
		    var data = response.data;
		    var name = ($routeParams.frame || data[0].frame['@name']);
		    frameDataManager.frameData(name).then(function(response){
			var data = response.data;
			
			infoCtrl.info = data;
		    });
		});
	    }
	};
    }
})();
