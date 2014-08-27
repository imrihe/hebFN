(function () {
    angular.module('hebFN.sentenceSearch', [
	'fnServices',
	'hebFN.models',
	'hebFN.constants'
    ]).
	controller('sentenceSearch', search);

    search.$injector = ['$scope', '$routeParams', 'searchManager', 'serverConstants', 'sentenceDataService'];

    function search ($scope, $routeParams, searchManager, serverConstants, sentenceDataService) {
	var self = this;
	var lu = $routeParams.lu;

	this.frame = $routeParams.frame;

	this.results = [];
	this.page = 1;
	this.diversify = 'low';

	this.POSs = serverConstants.constants.hebPosType;

	reset();

	this.isConnectedToLU = function () {
	    return angular.isDefined($routeParams.lu);
	};

	this.toggleTermInclude = function () {
	    self.luInclude = !self.luInclude;
	};

	this.addTerm = function () {
	    if (!self.luName) {
		return;
	    }

	    var term = {
		word: self.luName,
		pos: self.luPOS.toLowerCase(),
		type: self.luType,
		include: self.luInclude
	    };

	    self.searchTerms.push(term);

	    resetTerm();
	};

	this.removeTerm = function (idx) {
	    self.searchTerms.splice(idx, 1);
	}

	this.updateAdditional = function () {
	    var word = self.additionalWord;
	    
	    if (!word) return;

	    self.additionalWord = '';

	    self.additionalWords.push(word);
	};

	this.removeAdditional = function (idx) {
	    self.additionalWords.splice(idx, 1);
	};

	this.reset = reset;

	this.handleEnter = function (e) {
	    if (e.keyCode === 13) {		
		self.updateAdditional();
	    }
	};

	this.doSearch = function () {
	    self.searching = true;
	    
	    if (self.luName) {
		self.addTerm();
	    }
	    
	    var p = self.searchTerms[0];

	    var params = {
		pos: p.pos || 'v',
		text: p.word || '', 
		field: p.type || 'lemma',
		page: self.page || 1, 
		diversify : self.diversify,
		optionals: self.additionalWords
	    };

	    self.results = sentenceDataService.search(params, function () {self.searching = false});
	};

	this.setCorrelation = function (idx, status) {
	    if (angular.isDefined(self.frame) && angular.isDefined(lu)) {
		this.results[id].setCorrelationStatus(self.frame, lu, status);
	    }
	};

	this.getPage = function (page) {
	    self.page = page;
	    self.doSearch();
	}

	function reset () {
	    resetTerm();

	    self.additionalWord = '';
	    self.searchTerms = [];
	    self.additionalWords = [];

	    if (lu) {
		var parts = lu.split('.');
		self.luPOS = parts.pop().toUpperCase();
		self.luName = parts.join('.');
	    }
	};

	function resetTerm () {
	    self.luName = '';
	    self.luPOS = '';
	    self.luType = 'lemma';
	    self.luInclude = true;

	    $('#luName').focus();
	};

	if (angular.isDefined(lu)) {
	    this.doSearch();
	}
    };
})();
