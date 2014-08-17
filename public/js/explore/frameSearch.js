(function(){
    angular.module('fnExplore').
	directive('frameSearch', frameSearch);

    frameSearch.$inject = ['frameDataManager'];

    function frameSearch(frameDataManager) {
	return {
	    templateUrl: 'partials/explore/frame-search.html',
	    restrict: 'E',
	    controller: searchCtrl,
	    controllerAs: 'exploreSearch'
	};

	function searchCtrl(){
	    var searchCtrl = this;

	    var pageSize = 20;
	    var frames = [];
	    var fullSearchResults;

	    activate();

	    this.currentPage = 0;
	    this.numPages = 0;
	    this.searchResults = [];

	    this.query = '';

	    this.isFirstPage = function() {
		return !searchCtrl.numPages || searchCtrl.currentPage === 1;
	    };

	    this.isLastPage = function() {
		return !searchCtrl.numPages || searchCtrl.currentPage === searchCtrl.numPages;
	    };

	    this.changePage = function(page) {
		if (page > searchCtrl.numPages) {
		    page = searchCtrl.numPages;
		} else if (page < 1) {
		    page = 1;
		}

		searchCtrl.searchResults = fullSearchResults.slice((page-1)*pageSize, page*pageSize);

		searchCtrl.currentPage = page;
	    }

	    this.filterFrames = function(query) {
		query = query.toLowerCase();
		fullSearchResults = frames.filter(function(x){return x.toLowerCase().indexOf(query) >= 0;});
		searchCtrl.numPages = Math.ceil(fullSearchResults.length / pageSize);
		searchCtrl.changePage(1);
	    }

	    /// initialization ///
	    function activate(){
		frameDataManager.listFrames().then(function(response){
		    var data = response.data;
		    fullSearchResults = frames = data.map(function(x) { return x.frame['@name']; });
		    searchCtrl.numPages = Math.ceil(frames.length / pageSize);

		    searchCtrl.changePage(1);
		});
	    }

	};
    };
})();
