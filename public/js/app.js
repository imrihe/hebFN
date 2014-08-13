(function(){
    angular.module('hebFN', [
	'ngRoute'
    ]).config(['$routeProvider', config]);

    function config($routeProvider) {
	$routeProvider.when('/', {
	    template: 'Hello'
	});
    }
})();
