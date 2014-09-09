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
	    var self = this;

	    this.name = frameName;
	    this.addComment = addComment;
	    this.removeLU = removeLU;

	    frameData(this.name).then(function (result) {
		angular.extend(self, result.data);

		self.hebLUs = self.hebData.lexUnit.map(function (x) {
		    return luDataService.getLU(self.name, x);
		}).sort(function (a, b) {
		    return a.name.localeCompare(b.name);
		});
	    });

	    function frameData (name) {
		var url = '/heb/framedata';
		var params = {framename: name};

		return $http.get(url, {
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
		var url = '/heb/addcomment';

		var params = {
		    type: 'frame',
		    framename: this.name,
		    comment: comment
		};

		return $http({
		    method: 'POST',
		    url: url,
		    data: params,
		    responseType: 'json'
		}).success(function (response) {
		    this.hebData.comments.push(response);
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
