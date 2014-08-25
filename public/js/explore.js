(function() {
    angular.module('hebFN.explore', [
	'hebFN.models',
	'hebFN.englishFrame',
	'hebFN.manageFrame'
    ]).
	controller('exploreMain', explore);

    explore.$injector = ['$routeParams'];

    function explore($routeParams) {
	this.frameName = $routeParams.frame;
    };
})();
