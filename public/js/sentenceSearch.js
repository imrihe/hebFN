(function () {
    angular.module('hebFN.sentenceSearch', [
	'fnServices',
	'hebFN.constants'
    ]).
	controller('sentenceSearch', search);

    search.$injector = ['$routeParams', 'searchManager', 'serverConstants'];

    function search ($routeParams, searchManager, serverConstants) {
	var self = this;
	var lu = $routeParams.lu;

	this.results = [];
	this.page = 1;
	this.diversify = 'low';

	this.POSs = serverConstants.constants.hebPosType;

	reset();

	this.toggleTermInclude = function () {
	    self.luInclude = !self.luInclude;
	};

	this.addTerm = function () {
	    if (!self.luName) {
		return;
	    }

	    var term = {
		word: self.luName,
		pos: self.luPOS,
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
		pos: p.pos || 'V',
		text: p.word || '', 
		field: p.type || 'lemma',
		page: self.page || 1, 
		diversify : self.diversify,
		optionals: self.additionalWords
	    };

	    searchManager.search(params).then(function (res) {
		self.results = res.data;
		self.searching = false;
	    });
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
		self.luPOS = parts.pop();
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
    };
})();
