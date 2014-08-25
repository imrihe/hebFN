(function (angular) {
    angular.module('hebFN.models', []).
	factory('frameDataService', frameDataFactory);

    frameModel.$injector = ['$http'];

    function frameDataFactory ($http) {

	return {
	    listFrames: listFrame,
	    getFrame: frameModel
	};

	function frameModel (frameName) {   
	    frameData(frameName).then(function (result) {
		angular.extend(this, result.data);
	    });
	};

	frameModel.prototype = {
	    addComment = addComment;
	};

	var listFramesURL = '//localhost:3003/eng/framenames',
        frameDataURL = '//localhost:3003/heb/framedata', 
        addCommentURL = '//localhost:3003/heb/addcomment';

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
    };
})(angular);
