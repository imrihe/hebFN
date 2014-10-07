(function (angular) {
    angular.module('hebFN.constants', []).
	service('serverConstants', loadConstants);

    loadConstants.$injector = ['$http'];

    function loadConstants ($http) {
	var self = this;

	this.constants = {};

	$http.get('constants', {
	    type: 'json',
	    cache: true
	}).then(function (result) {
	    result.data.forEach(function (x) {
		self.constants[x.name] = x.values;
	    });
	});
    };
})(angular);
