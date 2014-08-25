(function(){
    angular.module('hebFN.manageFrame', [
	'fnServices',
	'hebFN.englishFrame',
	'hebFN.commentsWidget'
    ]).
	directive('manageFrame', manageFrame);

    manageFrame.$injector = ['frameDataManager'];

    function manageFrame (){
	return {
	    restrict: 'E',
	    templateUrl: 'partials/manage-frame.html',
	    scope: {'frameName': '='},
	    controller: ctrl,
	    controllerAs: 'manageFrame'
	}
    }
    
    function ctrl ($scope, frameDataManager) {
	var self = this;
	
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
		framename: $scope.frameName,
		comment: self.newComment
	    };
	    
	    self.newComment = '';

	    frameDataManager.addComment(params).then(function(res){
		self.info.hebData.comments.push(res);
	    });
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

	frameDataManager.frameData($scope.frameName).then(function(response){
	    self.info = response.data;
	});
    }
})();
