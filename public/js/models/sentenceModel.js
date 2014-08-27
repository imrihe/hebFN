(function (angular) {
    angular.module('hebFN.models', []).
	factory('sentenceDataService', sentenceDataFactory);

    sentenceDataFactory.$injector = ['$http'];

    function sentenceDataFactory ($http) {
	return {
	    search: search,
	    getByID: getByID
	};


	function SentenceModel (sentence) {
	    var nonLetter = "[^\w\u05D0-\u05EA]";

	    angular.extend(this, sentence);

	    this.highlight = function (word, type, style) {
		var text = self.text;
		var whatToHighlight = self.fullSentence.words.filter(function (x) {
		    return x[type] === word;
		});

		whatToHighlight.forEach(function (x) {
		    var pattern = new RegExp(x.word+"("+nonLetter+")", 'g');
		    text = text.replace(pattern, '<span class="'+style+'">'+x.word+'</span>$1');
		});
		
		return text;
	    };

	    this.setCorrelationStatus = function (frame, lu, status) {

	    };
	};

	function search (params, cb) {
	    var url = '//localhost:3003/external/exampleSentences';
	    
	    var searchResults = [];
	    
	    $http.get(url, {
		params: params,
		responseTyep: 'json'
	    }).then(function (response) {
		angular.extend(searchResults,
			       response.data.map(function (x) {
				   return new SentenceModel(x);
			       }));
		cb();
	    });
	    
	    return searchResults;		    
	};

	function getByID (id) {};
    };
})(angular);
