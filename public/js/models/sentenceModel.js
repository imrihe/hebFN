(function (angular) {
    angular.module('hebFN.models').
	factory('sentenceDataService', sentenceDataFactory);

    sentenceDataFactory.$injector = ['$http'];

    function sentenceDataFactory ($http) {
	return {
	    search: search,
	    getByID: getByID
	};


	function SentenceModel (sentence) {
	    var self = this;
	    var nonLetter = "[^\w\u05D0-\u05EA]";

	    angular.extend(this, sentence);

	    this.correlate = function (frame, lu) {
		setCorrelationStatus(frame, lu, 'good');
	    };

	    this.reject = function (frame, lu) {
		setCorrelationStatus(frame, lu, 'bad');
	    };

	    this.flag = function (frame, lu) {
		setCorrelationStatus(frame, lu, 'maybe');
	    };

	    var setCorrelationStatus = function (frame, lu, status) {
		var url = '/heb/setSentCorr';
		var params = {
		    luname: lu,
		    framename: frame,
		    sentid: self._id,
		    status: status,
		    text: self.text
		};

		$http.post(url, {
		    params: params
		});
	    };
	};

	function search (params, cb) {
	    var url = '/external/exampleSentences';
	    
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

	function getByID (id) {

	};
    };
})(angular);
