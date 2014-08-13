(function() {
    angular.module('fnServices', []);

    angular.module('fnServices').
	constant('listFramesURL', 'eng/framenames');

    angular.module('fnServices').
	factory('listFrames', listFrames);

    listFrames.inject = ['$http', 'listFramesURL'];

    function listFrames ($http, listFramesURL) {
	return $http.get(listFramesURL);
    }
})();
