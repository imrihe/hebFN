(function(){
    angular.module('fnExplore').
	directive('frameInfo', frameInfo);

    frameInfo.$inject = ['$routeParams', 'listFrames'];

    function frameInfo($routeParams, listFrames) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl(){
	    var infoCtrl = this;

	    this.info = {};

	    activate();

	    /// initialization ///
	    function activate(){
		listFrames.then(function(response){
		    var data = response.data;
		    var name = ($routeParams.frame || data[0].frame['@name']).toLowerCase();

		    infoCtrl.info = data.filter(function(x){ return x.frame['@name'].toLowerCase() === name; })[0].frame;
		});
	    }
	};

    };
})();
