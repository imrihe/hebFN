(function(){
    angular.module('hebFN.manageFrame', [
	'fnServices',
	'hebFN.englishFrame'
    ]).
	controller('manageFrame', manageFrame);

    manageFrame.$injector = ['$routeParams',  'listFrames', 'frameData'];

    function manageFrame($routeParams, listFrames, frameData) {
	var self = this;
	var name = $routeParams.frame;

	this.info = {};
	this.activeEngLU = '';
	this.activeEngLUIdx = -1;

	this.selectActiveEngLU = function(idx){
	    self.activeEngLUIdx = idx;
	    lu = self.info.translations[idx];

	    fixedTranslations = [];
	    lu.translation.forEach(function(x) {
		fixedTranslations = fixedTranslations.concat(x.vals.map(function(y){
		    return {name: y, pos: x.pos[0]};
		}));
	    });

	    lu.translations = fixedTranslations;
	    self.activeEngLU = lu;
	}

	frameData.forFrame(name).then(function(response){
	    self.info = response.data;
	});
    }
})();
