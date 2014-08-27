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
	config(config).
	run(run).
	controller('mainController', ctrl);

    config.$injector = ['$routeProvider'];

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
    };

    run.$injector = ['$http', 'serverConstants'];

    function run ($http, serverConstants){
	$http({
	    method: 'OPTIONS',
	    url: '//localhost:3003/',
	    headers: {'Allow-Control-Allow-Origin': '*'}
	});
    };

    ctrl.$injector = [];

    function ctrl () {
	var self = this;

	this.login = function () {
	    console.log(self.username, self.password);
	};
    };
})();
