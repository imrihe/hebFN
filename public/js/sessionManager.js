(function (angular) {
    angular.module('hebFN').
	service('SessionManager', session);

    session.$injector = [];

    function session () {
	var self = this;

	this.create = function () {
	    self.authenticated = true;
	};

	this.destroy = function () {
	    self.authenticated = false;
	};

	this.isAuthenticated = function () {
	    return self.authenticated;
	};

	return this;
    };
})(angular);
