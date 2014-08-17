(function(){
    angular.module('hebFN.manageFrame', [
	'fnServices',
	'hebFN.englishFrame'
    ]).
	controller('manageFrame', manageFrame);

    manageFrame.$injector = ['$routeParams',  'frameDataManager'];

    function manageFrame($routeParams, frameDataManager) {
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

	this.toggleMenu = function(idx) {
	    $('#menu'+idx).toggleClass('hide');
	}

	this.addComment = function() {
	    var params = {
		type: 'frame',
		framename: name,
		comment: self.newComment
	    };
	    
	    self.newComment = '';

	    frameDataManager.addComment(params).then(function(res){
		self.info.hebData.comments.push(res);
	    });
	}

	frameDataManager.frameData(name).then(function(response){
	    self.info = response.data;
	});
    }
})();
