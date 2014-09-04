(function (angular) {
    angular.module('hebFN.models').
	factory('sentenceDataService', sentenceDataFactory);

    sentenceDataFactory.$injector = ['$http', '$q'];

    function sentenceDataFactory ($http, $q) {
	return {
	    search: search,
	    getByID: getByID,
	    add: add
	};


	function SentenceModel (sentence) {
	    var self = this;
	    var nonLetter = "[^\w\u05D0-\u05EA]";

	    angular.extend(this, sentence);

	    this.correlate = function (frame, lu) {
		return setCorrelationStatus(frame, lu, 'good');
	    };

	    this.reject = function (frame, lu) {
		return setCorrelationStatus(frame, lu, 'bad');
	    };

	    this.flag = function (frame, lu) {
		return setCorrelationStatus(frame, lu, 'maybe');
	    };

	    var setCorrelationStatus = function (frame, lu, status) {
		var url = '/heb/setSentCorr';
		var params = {
		    luname: lu,
		    framename: frame,
		    sentid: self.id,
		    status: status,
		    text: self.text
		};

		return $http({
		    method: 'POST',
		    url: url,
		    data: params,
		    headers: { 'Content-Type': 'application/json'}
		}).success(function () {
		    self.status = status;
		});
	    };
	};

	function search (params, cb) {
	    var url = '/external/exampleSentences';
	    
	    var searchResults = [];
	    
	    $http.get(url, {
		params: params,
		responseType: 'json'
	    }).then(function (response) {
		angular.extend(searchResults,
			       response.data.map(function (x) {
				   return new SentenceModel(x);
			       }));
		cb(searchResults);
	    });
	    
	    return searchResults;		    
	};

	function add (text) {
	    var url = "/external/addSentence";

	    var params = {
		text: text,
		preview: true
	    };
	    
	    var deferred = $q.defer();

	    $http({
		method: 'POST',
		url: url,
		data: params,
		headers: { 'Content-Type': 'application/json'}
	    }).success(function (response) {
		deferred.resolve(new SentenceModel(response));
	    });

	    return deferred.promise;
	};

	function getByID (id) {

	};
    };
})(angular);
