(function(){
    angular.module('hebFN', [
	'ngRoute',
	'ngMessages',
	'hebFN.models',
	'hebFN.explore',
	'hebFN.manageFrame',
	'hebFN.manageLUs',
	'hebFN.sentenceSearch',
	'hebFN.constants'
    ]).
	config(config).
	run(run).
	controller('userController', ctrl).
	factory('AuthInterceptor', interceptor);

    config.$injector = ['$routeProvider', '$httpProvider'];

    function config($routeProvider, $httpProvider) {
	$routeProvider.
	    when('/explore/:frame?', {
		templateUrl: 'partials/explore.html',
		controller: 'exploreMain',
		controllerAs: 'explore'
	    }).when('/edit/:frame/:lu?', {
		templateUrl: 'partials/manage-lu.html',
		controller: 'manageLU',
		controllerAs: 'manageLU'
	    }).when('/search/:frame/:lu', {
		templateUrl: 'partials/sentence-search.html',
		controller: 'sentenceSearch',
		controllerAs: 'search'
	    }).when('/sentences/:frame/:lu', {
		templateUrl: 'partials/lu-sentences.html',
		controller: 'luSentences',
		controllerAs: 'sentences'
	    }).otherwise('/explore');

	$httpProvider.interceptors.
	    push([
		'$injector', 
		function ($injector) {
		    return $injector.get('AuthInterceptor')
		}
	    ]);
    };

    run.$injector = ['$rootScope', '$timeout', 'Authenticator', 'serverConstants'];

    function run ($rootScope, $timeout, Authenticator, serverConstants){
	Authenticator.ping().finally(function () {
	    $rootScope.$on('event:loginRequired', function (e, next) {
		// clear session
		Authenticator.logout(true);

		// show warning
		$('#auth-error').removeClass('hide');
		$timeout(function () {
		    $('#auth-error').addClass('hide');
		}, 3000);
	    });
	});

	$rootScope.$on('event:loginError', function (e, next) {
	    // show warning
	    $('#login-error').removeClass('hide');
	    $timeout(function () {
		$('#login-error').addClass('hide');
	    }, 3000);
	});
    };

    interceptor.$injector = ['$rootScope', '$q'];

    function interceptor ($rootScope, $q) {
	return {
	    responseError: error
	};
	
	function error(response) {
	    var status = response.status;
	    
	    if (response.config.url === '/login') {
		$rootScope.$broadcast('event:loginError');
	    } else if (status == 401) {
		$rootScope.$broadcast('event:loginRequired');
	    }

	    return $q.reject(response);	    
	}
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
