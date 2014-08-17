(function() {
    angular.module('fnServices', []);

    angular.module('fnServices').
	constant('listFramesURL', 'eng/framenames');

    angular.module('fnServices').
	factory('listFrames', listFrames);

    listFrames.$inject = ['$http', 'listFramesURL'];

    function listFrames ($http, listFramesURL) {
	return $http.get(listFramesURL, 
			 {
			     cache: true, 
			     responseType: 'json',
			 });
    }

    frameData.$inject = ['$http', 'frameDataURL'];

    function frameData ($http, frameDataURL) {
	return {
	    forFrame: function(name) {
		return $http.get(frameDataURL,
				 {
				     params: {framename: name},
				     responseType: 'json'
				 });
	    }
	};
    }
})();
