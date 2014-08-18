(function() {
    angular.module('fnServices', []);

    angular.module('fnServices').
	factory('frameDataManager', frameDataManager);

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
})();
