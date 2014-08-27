(function(){
    angular.module('hebFN', [
	'ngRoute',
	'hebFN.models',
	'hebFN.explore',
	'hebFN.manageFrame',
	'hebFN.manageLUs',
	'hebFN.sentenceSearch',
	'hebFN.constants'
    ]).
	config(['$routeProvider', config]).
	run(['$http', 'serverConstants', function($http, serverConstants){
	    $http({
		method: 'OPTIONS',
		url: '//localhost:3003/',
		headers: {'Allow-Control-Allow-Origin': '*'}
	    });
	}]);

    function config($routeProvider) {
	$routeProvider.
	    when('/:frame?', {
		templateUrl: 'partials/explore.html',
		controller: 'exploreMain',
		controllerAs: 'explore'
	    }).when('/:frame/:lu?', {
		templateUrl: 'partials/manage-lu.html',
		controller: 'manageLU',
		controllerAs: 'manageLU'
	    }).when('/:frame/:lu/sentences', {
		templateUrl: 'partials/sentence-search.html',
		controller: 'sentenceSearch',
		controllerAs: 'search'
	    });
    }
})();
