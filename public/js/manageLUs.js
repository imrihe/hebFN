(function(){
    angular.module('hebFN.manageLUs', [
	'fnServices',
	'hebFN.englishFrame',
	'hebFN.commentsWidget'
    ]).
	controller('manageLU', manageLU);

    manageLU.$injector = ['$routeParams',  'frameDataManager'];

    function manageLU ($routeParams, frameDataManager) {
	var self = this;
	var frameName = $routeParams.frame;
	var luName = $routeParams.lu;

	this.info = {};

	frameDataManager.frameData(frameName).then(function(response){
	    self.info = response.data;
	});
    }
})();
