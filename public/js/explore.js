(function() {
    angular.module('hebFN.explore', [
	'hebFN.models',
	'hebFN.englishFrame',
	'hebFN.manageFrame'
    ]).
	controller('exploreMain', explore);

    explore.$injector = ['$routeParams', '$location', 'frameDataService'];

    function explore($routeParams, $location, frameDataService) {
	this.frameName = $routeParams.frame;

	if (angular.isUndefined(this.frameName)) {
	    frameDataService.listFrames().then(function (response) {
		var name = response.data[0].frame['@name'];
		$location.path(name);
	    });
	}
    };
})();
