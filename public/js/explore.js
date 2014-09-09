(function() {
    angular.module('hebFN.explore', [
	'hebFN.models',
	'hebFN.englishFrame',
	'hebFN.manageFrame'
    ]).
	controller('exploreMain', explore);

    explore.$injector = ['$routeParams', '$location', 'frameDataService', 'SessionManager'];

    function explore($routeParams, $location, frameDataService, SessionManager) {
	this.frameName = $routeParams.frame;

	this.isLoggedIn = SessionManager.isAuthenticated;

	if (angular.isUndefined(this.frameName)) {
	    frameDataService.listFrames().then(function (response) {
		var name = response.data[0].frame['@name'];
		$location.path('explore/' + name);
	    });
	}
    };
})();
