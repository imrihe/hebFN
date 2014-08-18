(function() {
    angular.module('fnServices', []);

    angular.module('fnServices').
	factory('frameDataManager', frameDataManager).
	factory('luDataManager', luDataManager);

    frameDataManager.$inject = ['$http'];

    function frameDataManager ($http) {
	var listFramesURL = '//localhost:3003/eng/framenames',
	    frameDataURL = '//localhost:3003/heb/framedata', 
	    addCommentURL = '//localhost:3003/heb/addcomment';

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
	var luDataURL = '//localhost:3003/heb/lu',
	    saveLUURL = '//localhost:3003/heb/editlu',
	    addCommentURL = '//localhost:3003/heb/lu';

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

	function saveLU () {};
    }
})();
