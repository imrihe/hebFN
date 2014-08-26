(function(){
    angular.module('hebFN', [
	'ngRoute',
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
	    when('/search/:frame?/:lu?', {
		templateUrl: 'partials/sentence-search.html',
		controller: 'sentenceSearch',
		controllerAs: 'search'
	    }).when('/:frame?', {
		templateUrl: 'partials/explore.html',
		controller: 'exploreMain',
		controllerAs: 'explore'
	    }).when('/:frame/lu/:lu?', {
		templateUrl: 'partials/manage-lu.html',
		controller: 'manageLU',
		controllerAs: 'manageLU'
	    });
    }
})();
