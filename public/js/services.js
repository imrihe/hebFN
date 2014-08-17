(function() {
    angular.module('fnServices', []);

    angular.module('fnServices').
	factory('frameManager', frameManager);

    frameManager.$inject = ['$http'];

    function frameManager ($http) {
	var listFramesURL = '//localhost:3003/eng/framenames',
	    frameDataURL = '//localhost:3003/heb/framedata', 
	    addCommentURL = '//localhost:3003/heb/addcomment';

	return {
	    listframes: listFrames,
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
		responseType: 'json'
	    });
	}

	function addComment (commentData) {
	    return $http.get(addCommentURL, {
		params: commentData,
		responseTyep: 'json'
	    }
	}
    }
})();
