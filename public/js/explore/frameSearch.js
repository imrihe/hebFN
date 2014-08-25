(function(){
    angular.module('hebFN.explore').
	directive('frameSearch', frameSearch);

    frameSearch.$inject = ['frameDataService'];

    function frameSearch (frameDataService) {
	return {
	    templateUrl: 'partials/explore/frame-search.html',
	    restrict: 'E',
	    controller: searchCtrl,
	    controllerAs: 'exploreSearch'
	};

	function searchCtrl(){
	    var self = this;

	    var pageSize = 20;
	    var frames = [];
	    var fullSearchResults;

	    activate();

	    this.currentPage = 0;
	    this.numPages = 0;
	    this.searchResults = [];

	    this.query = '';

	    this.isFirstPage = function() {
		return !self.numPages || self.currentPage === 1;
	    };

	    this.isLastPage = function() {
		return !self.numPages || self.currentPage === self.numPages;
	    };

	    this.changePage = function(page) {
		if (page > self.numPages) {
		    page = self.numPages;
		} else if (page < 1) {
		    page = 1;
		}

		self.searchResults = fullSearchResults.slice((page-1)*pageSize, page*pageSize);

		self.currentPage = page;
	    }

	    this.filterFrames = function(query) {
		query = query.toLowerCase();
		fullSearchResults = frames.filter(function(x){return x.toLowerCase().indexOf(query) >= 0;});
		self.numPages = Math.ceil(fullSearchResults.length / pageSize);
		self.changePage(1);
	    }

	    /// initialization ///
	    function activate(){
		frameDataService.listFrames().then(function(response){
		    var data = response.data;
		    fullSearchResults = frames = data.map(function(x) { return x.frame['@name']; });
		    self.numPages = Math.ceil(frames.length / pageSize);

		    self.changePage(1);
		});
	    }

	};
    };
})();
