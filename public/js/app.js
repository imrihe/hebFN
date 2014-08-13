(function(){
    angular.module('hebFN', [
	'ngRoute',
	'fnExplore'
    ]).
	config(['$routeProvider', config]);

    function config($routeProvider) {
	$routeProvider.
	    when('/:frame?', {
		templateUrl: 'partials/explore.html',
		controller: 'exploreMain',
		controllerAs: 'explore'
	    });
    }
})();
