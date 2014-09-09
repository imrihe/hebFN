(function () {
    angular.module('hebFN.sentenceSearch', [
	'hebFN.models',
	'hebFN.constants'
    ]).
	controller('sentenceSearch', search).
	filter('highlightTerms', highlight);

    search.$injector = ['$routeParams', 'serverConstants', 'sentenceDataService', 'luDataService'];

    function search ($routeParams, serverConstants, sentenceDataService, luDataService) {
	var self = this;
	this.lu = $routeParams.lu;

	this.frame = $routeParams.frame;

	this.results = [];
	this.page = 1;
	this.diversify = 'low';
	this.luName = this.lu.substring(0, this.lu.lastIndexOf('.'));

	this.POSs = serverConstants.constants.hebPosType;

	reset();

	this.isConnectedToLU = function () {
	    return angular.isDefined($routeParams.lu);
	};

	this.toggleTermInclude = function () {
	    self.includeTerm = !self.includeTerm;
	};

	this.addTerm = function () {
	    if (!self.term) {
		return;
	    }
	    
	    if (self.term.indexOf('_') >= 0) {
		addCompoundTerm('_');
	    } else if (self.term.indexOf(' ') >= 0) {
		addCompoundTerm(' ');
	    } else {
		addSingleTerm();
	    }
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
	    
	    if (self.term) {
		self.addTerm();
	    }
	    
	    var p = self.searchTerms[0];

	    var params = {
	/*	framename: self.frame,
		luname: self.luName,*/
		'terms[]': self.searchTerms,
		page: self.page || 1, 
		diversify : self.diversify,
		'optionals[]': self.additionalWords
	    };

	    self.results = sentenceDataService.search(params, function (results) {
		self.searching = false;
		results.map(function (x) {
		   self.luInfo.
			getSentenceLUCorrelation(x.id).
			then(function (response) {
			    if (response.data) {
				x.status = response.data.status;
			    }
			});;
		});
	    });
	};

	this.getPage = function (page) {
	    self.page = page;
	    self.doSearch();
	}

	this.correlate = function (result) {
	    var old_status = result.status;

	    result.correlate(self.frame, self.lu).success(function (response) {
		if (response.results === 1) {
		    if (old_status !== 'good') {
			self.luInfo.sentenceCount++;
		    }
		}
	    });
	};

	this.reject = function (result) {
	    var old_status = result.status;

	    result.reject(self.frame, self.lu).success(function (response) {
		if (response.results === 1) {
		    if (old_status === 'good') {
			self.luInfo.sentenceCount--;
		    }
		}
	    });
	};

	this.flag = function (result) {
	    var old_status = result.status;

	    result.flag(self.frame, self.lu).success(function (response) {
		if (response.results === 1) {
		    if (old_status === 'good') {
			self.luInfo.sentenceCount--;
		    }
		}
	    });
	};

	this.addSentence = function () {
	    var newSentence = self.newSentence;
	    self.newSentence = '';

	    sentenceDataService.add(newSentence).then(function (sentence) {
		self.correlate(sentence);
	    });
	};

	function addSingleTerm (t) {
	    t = t || self.term;
	    
	    var term = {
		word: t,
		pos: self.termPOS.toLowerCase(),
		type: self.termType,
		include: self.includeTerm
	    };

	    self.searchTerms.push(term);

	    resetTerm();
	};

	function addCompoundTerm (sep) {
	    var terms = self.term.split(sep);

	    terms.forEach(function (t) {
		if (t.indexOf('@') >= 0) {
		    t = t.replace('@', '');
		    addSingleTerm(t);
		} else {
		    self.additionalWords.push(t);
		}
	    });
	}

	function reset () {
	    resetTerm();

	    self.additionalWord = '';
	    self.searchTerms = [];
	    self.additionalWords = [];

	    if (self.lu) {
		var parts = self.lu.split('.');
		self.termPOS = parts.pop();
		self.term = parts.join('.');
	    }
	};

	function resetTerm () {
	    self.term = '';
	    self.termPOS = '';
	    self.termType = 'lemma';
	    self.includeTerm = true;

	    $('#term').focus();
	};

	if (angular.isDefined(this.lu)) {
	    this.doSearch();
	    this.luInfo =  luDataService.getLU(self.frame, self.lu);
	}
    };

    function highlight () {	
	var nonLetter = "[^\w\u05D0-\u05EA]";
	return function (text, words, target) {
	    var resultText = text;
	    var whatToHighlight = words.filter(function (x) {
		return x.lemma === target;
	    });
	    
	    whatToHighlight.forEach(function (x) {
		var pattern = new RegExp(x.word+"("+nonLetter+")", 'g');
		text = text.replace(pattern, '<span class="highlightLU">'+x.word+'</span>$1');
	    });
	    
	    return text;
	}
    };
})();
