(function(){
    angular.module('hebFN', [
	'ngRoute',
	'fnExplore'
    ]).config(['$routeProvider, fnExplore', config]);

    function config($routeProvider, fnExplore) {
	$routeProvider.when('/', {
	    templateUrl: 'partials/explore.html',
	    controller: 'exploreMain',
	    controllerAs: 'explore'
	});
    }
})();
