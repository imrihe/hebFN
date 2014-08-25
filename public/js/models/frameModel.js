(function (angular) {
    angular.module('hebFN.models', []).
	factory('frameDataService', frameDataFactory);

    frameDataFactory.$injector = ['$http'];

    function frameDataFactory ($http) {

	return {
	    listFrames: listFrames,
	    getFrame: function (frameName) { return new FrameModel(frameName); }
	};

	function FrameModel (frameName) {
	    var self = this;
	    this.name = frameName;
	    frameData(this.name).then(function (result) {
		angular.extend(self, result.data);
	    });
	};

	frameModel.prototype.addComment = addComment;

	var listFramesURL = '//localhost:3003/eng/framenames',
            frameDataURL = '//localhost:3003/heb/framedata', 
            addCommentURL = '//localhost:3003/heb/addcomment';

	function listFrames () {
	    return $http.get(listFramesURL, {
		cache: true,
		responseType: 'json'
	    });
	};

	function frameData (name) {
	    var frameDataURL = '//localhost:3003/heb/framedata';
	    var params = {framename: name};

	    return $http.get(frameDataURL, {
		params: params,
		cache: true,
		responseType: 'json'
	    });
	};

	function addComment (comment) {
	    var params = {
		type: 'frame',
		framename: this.name,
		comment: comment
	    };

	    $http.post(addCommentURL, {
		params: params,
		responseTyep: 'json'
	    }).then(function (result) {
		this.hebData.comments.push(res);
	    });
	};
    };
})(angular);
