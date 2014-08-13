(function() {
    angular.module('fnExplore', ['fnServices']);

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
	    var searchCtrl = this;

	    var pageSize = 20;
	    var numPages = 0;

	    this.currentPage = 0;
	    this.searchResults = [];

	    this.isFirstPage = function() {
		return !numPages || searchCtrl.currentPage === 1;
	    };

	    this.isLastPage = function() {
		return !numPages || searchCtrl.currentPage === numPages;
	    };
	};
    };

    function frameInfo() {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E'
	};
    };
})();
