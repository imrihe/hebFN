(function(){
    angular.module('hebFN.manageFrame', [
	'hebFN.models',
	'hebFN.englishFrame',
	'hebFN.commentsWidget'
    ]).
	directive('manageFrame', manageFrame);

    manageFrame.$injector = ['frameDataService'];

    function manageFrame (){
	return {
	    restrict: 'E',
	    templateUrl: 'partials/manage-frame.html',
	    scope: {'frameName': '='},
	    controller: ctrl,
	    controllerAs: 'manageFrame'
	}
    }
    
    function ctrl ($scope, frameDataService) {
	var self = this;

	this.activeEngLU = '';

	this.selectActiveEngLU = function(idx){
	    lu = self.frame.translations[idx];

	    fixedTranslations = [];
	    lu.translation.forEach(function(x) {
		fixedTranslations = fixedTranslations.concat(x.vals.map(function(y){
		    return {name: y, pos: x.pos[0]};
		}));
	    });

	    lu.translations = fixedTranslations;
	    self.activeEngLU = lu;

	    sessionStorage.setItem($scope.frameName+'.activeEngLU', idx);
	}

	this.toggleMenu = function(idx) {
	    $('#menu'+idx).toggleClass('hide');
	}

	this.isAlreadyLU = function (translation) {
	    return !self.frame.hebLUs.some(function (x) {
		return (x.name === translation.name) &&
		    (x['@POS'].toLowerCase() === translation.pos);
	    });
	};

	this.isActiveEngLU = function (idx) {
	    var activeEngLU = sessionStorage.getItem($scope.frameName+'.activeEngLU');
	    return parseInt(activeEngLU) === idx;
	};

	function deleteLU () {
	    self.frame.removeLU(self.selectedLU);

	    $('#delete-lu').modal('hide');
	};

	$('#delete-lu').on('show.bs.modal', function (e){
	    $('#delete-button').off('click').on('click', function () {
		deleteLU();
	    });
	});

	if (angular.isDefined($scope.frameName)) {
	    self.frame = frameDataService.getFrame($scope.frameName);
	}
    }
})();
