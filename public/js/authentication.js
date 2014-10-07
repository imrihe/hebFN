(function (angular) {
    angular.module('hebFN').
	factory('Authenticator', auth);

    auth.$injector = ['$http', 'SessionManager'];

    function auth ($http, SessionManager) {
	return {
	    login: login,
	    logout: logout,
	    ping: ping,
	    status: SessionManager.isAuthenticated
	};

	function login (username, password) {
	    $http({
		method: 'POST',
		url: 'login',
		data: $.param(
		    {
			username: username,
			password: password
		    }),
		headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
	    })
		.success(function (data, status, headers, config) {
		    SessionManager.create();
		})
		.error(function (data, status, headers, config) {
		    SessionManager.destroy();
		});
	};

	function logout (local) {
	    local = local || false;
	    
	    if (local) {
		SessionManager.destroy();
	    } else {
		$http.get('/logout').success(function (response) {
		    SessionManager.destroy();
		});
	    }
	};

	function ping () {
	    return $http.get('auth').
		success(function (data, status, headers, config) {
		    SessionManager.create();
		}).
		error(function (data, status, headers, config) {
		    SessionManager.destroy();
		});
	};


    };
})(angular);
