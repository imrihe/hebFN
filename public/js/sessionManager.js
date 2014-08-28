(function (angular) {
    angular.module('hebFN').
	service('SessionManager', session);

    session.$injector = [];

    function session () {
	this.create = function () {
	    this.authenticated = true;
	};

	this.destroy = function () {
	    this.authenticated = false;
	};

	this.isAuthenticated = function () {
	    return this.authenticated;
	};

	return this;
    };
})(angular);
