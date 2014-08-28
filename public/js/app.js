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

    run.$injector = ['$http', 'serverConstants'];

    function run ($http, serverConstants){
	$http({
	    method: 'OPTIONS',
	    url: '//localhost:3003/',
	    headers: {'Allow-Control-Allow-Origin': '*'}
	});
    };

    ctrl.$injector = ['$http', '$window', 'SessionManager'];

    function ctrl ($http, $window, SessionManager) {
	var self = this;

	this.login = function () {
	    $http({
		method: 'POST',
		url: '//localhost:3003/login',
		data: $.param(
		    {
			username: self.username,
			password: self.password
		    }),
		headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
	    })
		.success(function (data, status, headers, config) {
		    SessionManager.create();
		    console.log('success!');
		})
		.error(function (data, status, headers, config) {
		    // Erase the token if the user fails to log in
		    SessionManager.destroy();
		    console.log('fail');
		});
	};

	this.isLoggedIn = function () {
	    SessionManager.isAuthenticated();
	};
    };
})();
