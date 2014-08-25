(function() {
    angular.module('fnExplore', [
	'fnServices',
	'hebFN.englishFrame',
	'hebFN.manageFrame'
    ]);

    angular.module('fnExplore').
	controller('exploreMain', explore);

    explore.$injector = ['$routeParams'];

    function explore($routeParams) {
	this.frameName = $routeParams.frame;
    };
})();
