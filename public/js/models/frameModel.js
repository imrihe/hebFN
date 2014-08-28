(function (angular) {
    angular.module('hebFN.models').
	factory('frameDataService', frameDataFactory);

    frameDataFactory.$injector = ['$http'];

    function frameDataFactory ($http) {

	return {
	    listFrames: listFrames,
	    getFrame: function (frameName) { return new FrameModel(frameName); }
	};

	function FrameModel (frameName) {
	    var frameDataURL = '/heb/framedata',
	        addCommentURL = '/heb/addcomment';

	    var self = this;

	    this.name = frameName;
	    this.addComment = addComment;

	    frameData(this.name).then(function (result) {
		angular.extend(self, result.data);
	    });

	    function frameData (name) {
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

	function listFrames () {
	    var listFramesURL = '/eng/framenames';

	    return $http.get(listFramesURL, {
		cache: true,
		responseType: 'json'
	    });
	};
    };
})(angular);
