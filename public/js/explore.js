(function() {
    angular.module('fnExplore', ['fnServices']);

    angular.module('fnExplore').
	controller('exploreMain', explore).
	directive('frameSearch', frameSearch).
	directive('frameInfo', frameInfo);

    frameSearch.$inject = ['listFrames'];

    function explore() {};

    function frameSearch(listFrames) {
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
	    var frames = [];

	    activate();

	    this.currentPage = 0;
	    this.searchResults = [];

	    this.isFirstPage = function() {
		return !numPages || searchCtrl.currentPage === 1;
	    };

	    this.isLastPage = function() {
		return !numPages || searchCtrl.currentPage === numPages;
	    };

	    this.changePage = function(page) {
		if (page > numPages) {
		    page = numPages;
		} else if (page < 1) {
		    page = 1;
		}

		searchCtrl.searchResults = frames.slice((page-1)*pageSize, page*pageSize);

		searchCtrl.currentPage = page;
	    }

	    /// initialization ///
	    function activate(){
		listFrames.then(function(response){
		    var data = response.data;
		    frames = data.map(function(x) { return x.frame['@name']; });
		    numPages = frames.length / pageSize;

		    searchCtrl.changePage(1);
		});
	    }
	};
    };

    function frameInfo() {
	return {
	    templateUrl: 'partials/explore/frame-info.html',
	    restrict: 'E'
	};
    };
})();
