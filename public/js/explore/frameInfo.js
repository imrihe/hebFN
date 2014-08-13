(function(){
    angular.module('fnExplore').
	directive('frameInfo', frameInfo);

    frameInfo.$inject = ['listFrames'];

    function frameInfo(listFrames) {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E',
	    controller: infoCtrl,
	    controllerAs: 'exploreInfo'
	};

	function infoCtrl(){};
    };
})();
