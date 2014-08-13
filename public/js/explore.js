(function() {
    angular.module('fnExplore', []);

    angular.module('fnExplore').
	controller('exploreMain', explore).
	directive('frameSearch', frameSearch).
	directive('frameInfo', frameInfo);

    function explore() {};

    function frameSearch() {
	return {
	    templateUrl: 'partials/explore/frame-search.html',
	    restrict: 'E',
	    controller: searchCtrl,
	    controllerAs: 'exploreSearch'
	};

	function searchCtrl(){
	    this.searchResults = [];
	};
    };

    function frameInfo() {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E'
	};
    };
})();
