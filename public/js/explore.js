(function() {
    angular.module('fnExplore', ['fnServices']);

    angular.module('fnExplore').
	controller('exploreMain', explore).
	directive('frameInfo', frameInfo);

    function explore() {};


    function frameInfo() {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E'
	};
    };
})();
