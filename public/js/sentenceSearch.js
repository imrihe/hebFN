(function () {
    angular.module('hebFN.sentenceSearch', []).
	controller('sentenceSearch', search);

    search.$injector = ['$routeParams'];

    function search ($routeParams) {
	var self = this;
	var lu = $routeParams.lu;

	reset();

	this.toggleTermInclude = function () {
	    self.luInclude = !self.luInclude;
	};

	this.addTerm = function () {
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
	    if (self.luName) {
		self.addTerm();
	    }
	    console.log('preforming search with params:',this);
	};

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
