(function(){
    angular.module('hebFN.manageFrame', [
	'hebFN.models',
	'hebFN.englishFrame',
	'hebFN.commentsWidget'
    ]).
	controller('manageFrame', manageFrame);

    manageFrame.$injector = ['$routeParams', 'frameDataService'];

    function manageFrame($routeParams, frameDataService) {
	var self = this;

	this.name = $routeParams.frame;
	this.activeEngLU = '';
	this.activeEngLUIdx = -1;

	this.selectActiveEngLU = function(idx){
	    self.activeEngLUIdx = idx;
	    lu = self.frame.translations[idx];

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

	this.addComment = function(comment) {
	    self.frame.addComment(comment);
	    self.newComment = '';
	};

	function deleteLU () {
	    console.log('deleting', self.selectedLU['@name']);
	    $('#delete-lu').modal('hide');
	};

	$('#delete-lu').on('show.bs.modal', function (e){
	    $('#delete-button').off('click').on('click', function () {
		deleteLU();
	    });
	});

	self.frame = frameDataService.getFrame(this.name);
    }
})();
