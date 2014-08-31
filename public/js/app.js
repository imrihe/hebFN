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
	controller('userController', ctrl);

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

    run.$injector = ['Authenticator', 'serverConstants'];

    function run (Authenticator, serverConstants){
	Authenticator.ping();
    };

    ctrl.$injector = ['Authenticator'];

    function ctrl (Authenticator) {
	var self = this;
	
	this.login = function () {
	   Authenticator.login(self.username, self.password);
	};

	this.logout = Authenticator.logout;

	this.isLoggedIn = Authenticator.status;
    };
})();
