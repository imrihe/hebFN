(function (angular) {
    angular.module('hebFN.models').
	factory('frameDataService', frameDataFactory);

    frameDataFactory.$injector = ['$http', 'luDataService'];

    function frameDataFactory ($http, luDataService) {

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
	    this.removeLU = removeLU;

	    frameData(this.name).then(function (result) {
		angular.extend(self, result.data);

		self.hebLUs = self.hebData.lexUnit.map(function (x) {
		    return luDataService.getLU(self.name, x);
		});
	    });

	    function frameData (name) {
		var params = {framename: name};

		return $http.get(frameDataURL, {
		    params: params,
		    // cache: true,
		    responseType: 'json'
		});
	    };

	    function removeLU (lu) {
		return lu.remove().success(function (response) {
		    self.hebLUs = self.hebLUs.filter(function (x) {
			return x !== lu;
		    });
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
