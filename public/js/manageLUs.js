(function(){
    angular.module('hebFN.manageLUs', [
	'hebFN.models',
	'hebFN.englishFrame',
	'hebFN.commentsWidget',
	'hebFN.constants'
    ]).
	controller('manageLU', manageLU).
	directive('validCompound', validCompound);

    manageLU.$injector = ['$routeParams', '$location', 'frameDataService', 'luDataService', 'serverConstants'];

    function manageLU ($routeParams, $location, frameDataService, luDataService, serverConstants) {
	var self = this;
	var luName = $routeParams.lu;

	this.frameName = $routeParams.frame;
	this.POSs = serverConstants.constants.hebPosType;
	this.statusValues = serverConstants.constants.luStatus;
	this.semTypes = serverConstants.constants.semType;

	this.multiwordTypes = [{sep: '_', name: 'Contiguous compound'}, 
				{sep: ' ', name: 'Non-contiguous compound'}];

	this.separator = this.multiwordTypes[0].sep;

	this.isCompound = function (val) {
	    var result = false;
	    val = val || self.luInfo.name || '';
	    
	    self.multiwordTypes.forEach(function (x) {
		result |= (val.indexOf(x.sep) > -1);
	    });

	    return result;
	}

	this.transformName = function () {
	    if (!self.luInfo.name) return;

	    self.multiwordTypes.forEach(function (x) {
		var sepRegex = new RegExp(x.sep+'+', 'g');
		self.luInfo.name = self.luInfo.name.replace(sepRegex, self.separator);
	    });

	    var dashRegex = new RegExp(self.separator+'*-'+self.separator+'*', 'g');
	    self.luInfo.name = self.luInfo.name.replace(dashRegex, self.separator+'-'+self.separator);
	}

	this.isValidName = function () {
	    return !!self.luInfo.name.length && self.isValidCompound();
	}

	this.addSemType = function () {
	    if (self.semType) {
		self.luInfo.semType.push(self.semType);
	    }
	};

	this.removeSemType = function (idx) {
	    self.luInfo.semType.splice(idx,1);
	};

	this.save = function () {
	    return self.luInfo.save().then(function (result) {
		//TODO: show "saved"
	    });
	};

	this.saveAndReturn = function () {
	    self.save().then(function () {
		self.backToFrame();
	    });
	};

	this.backToFrame = function () {
	    $location.path('explore/'+self.frameName);
	};

	this.addComment = function (comment) {
	    self.save().then(function (result) {
		// TODO: if result is a failed save, don't post the comment,
		// and show and error
		self.luInfo.addComment(comment);
	    });
	};

	this.frameInfo = frameDataService.getFrame(this.frameName);
	this.luInfo = luDataService.getLU(this.frameName, luName);
    }

    function validCompound () {
	return {
	    restrict: 'A',
	    require: 'ngModel',
	    link: linker
	};

	function linker (scope, element, attrs, ctrl) {
	    var headWordMark = '@';

	    ctrl.$parsers.unshift(function (value) {
		var valid = isValidCompound(value);
		ctrl.$setValidity('compound', valid);
		return valid ? value : undefined;
	    });

	    ctrl.$formatters.unshift(function (value) {
		ctrl.$setValidity('compound', isValidCompound(value));
		return value;
	    });

	    function isValidCompound (value) {
		return !value || !scope.manageLU.isCompound(value) || 
		    value.indexOf(headWordMark) > -1;
	    };
	};
    };

})();
