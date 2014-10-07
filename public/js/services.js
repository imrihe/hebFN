(function() {
    angular.module('fnServices', []);

    angular.module('fnServices').
	factory('frameDataManager', frameDataManager).
	factory('luDataManager', luDataManager).
	factory('searchManager', searchManager);

    frameDataManager.$inject = ['$http'];

    function frameDataManager ($http) {
	var listFramesURL = 'eng/framenames',
	    frameDataURL = 'heb/framedata', 
	    addCommentURL = 'heb/addcomment';

	return {
	    listFrames: listFrames,
	    frameData: frameData,
	    addComment: addComment
	};

	function listFrames () {
	    return $http.get(listFramesURL, {
		cache: true,
		responseType: 'json',
	    });
	};

	function frameData (name) {
	    return $http.get(frameDataURL, {
		params: {framename: name},
		cache: true,
		responseType: 'json'
	    });
	};

	function addComment (commentData) {
	    return $http.post(addCommentURL, {
		params: commentData,
		responseTyep: 'json'
	    });
	};
    }

    luDataManager.$inject = ['$http'];

    function luDataManager ($http) {
	var luDataURL = 'heb/lu',
	    saveLUURL = 'heb/editlu',
	    addLUURL = 'heb/frameLuAssociation',
	    addCommentURL = 'heb/lu';

	return {
	    luData: luData,
	    addComment: addComment,
	    saveLU: saveLU
	};

	function luData (frameName, luName) {
	    return $http.get(luDataURL, {
		params: {framename: frameName, luname: luName},
		responseType: 'json'
	    });
	};

	function addComment (commentData) {
	    return $http.post(addCommentURL, {
		params: commentData,
		responseTyep: 'json'
	    });
	};

	function saveLU (luData) {
	    var url = saveLUURL;

	    if (!luData._id) {
		url = addLUURL;
		luDate.action = 'add';
	    }

	    return $http.post(saveLUURL, {
		params: luData,
		responseTyep: 'json'
	    });
	};
    };

    searchManager.$injector = ['$http'];

    function searchManager ($http) {
	var searchSentencesURL = 'external/exampleSentences';

	return {
	    search: search
	};

	function search (params) {
	    return $http.get(searchSentencesURL, {
		params: params,
		responseTyep: 'json'
	    });
	};
    };
})();
