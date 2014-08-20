(function(){
    angular.module('hebFN.manageLUs', [
	'fnServices',
	'hebFN.englishFrame',
	'hebFN.commentsWidget'
    ]).
	controller('manageLU', manageLU).
	directive('validCompound', validCompound);

    manageLU.$injector = ['$routeParams', 'frameDataManager', 'luDataManager'];

    function manageLU ($routeParams, frameDataManager, luDataManager) {
	var self = this;
	var luName = $routeParams.lu;

	this.frameName = $routeParams.frame;

	this.POSs = {
            noun:"n",
            verb:"v", 
            adjective:"a",
            adverb:"adv",
            preposition:"prep",
	    modal:"md"
	};

	this.statusValues = [
	    "initial",
	    "partial",
	    "full"
	];

	this.multiwordTypes = [{sep: '_', name: 'Contiguous compound'}, 
				{sep: ' ', name: 'Non-contiguous compound'}];

	this.frameInfo = {};
	this.luInfo = {'@name': luName};
	this.separator = this.multiwordTypes[0].sep;
	
	this.luName = getLUprop('@name').split('.')[0];

	Object.defineProperties(this, {
	    /*luName: {
		get : function () {
		    return getLUprop('@name').split('.')[0];
		},
		set: function (name) {
		    self.luInfo['@name'] = (name || '') + '.' + self.luPOS;
		}
	    },*/
	    luPOS: {
		get: function () {
		    return getLUprop('@name').split('.').pop() || self.luInfo['@POS'] || 'v';
		},
		set: function (pos) {
		    self.luInfo['@POS'] = pos.toUpperCase();
		    self.luInfo['@name'] = self.luName + '.' + pos;
		}
	    }
	});

	this.isCompound = function (val) {
	    var result = false;
	    val = val || self.luName || '';
	    
	    self.multiwordTypes.forEach(function (x) {
		result |= (val.indexOf(x.sep) > -1);
	    });

	    return result;
	}

	this.transformName = function () {
	    if (!self.luName) return;

	    self.multiwordTypes.forEach(function (x) {
		var sepRegex = new RegExp(x.sep+'+', 'g');
		self.luName = self.luName.replace(sepRegex, self.separator);
	    });

	    var dashRegex = new RegExp(self.separator+'*-'+self.separator+'*', 'g');
	    self.luName = self.luName.replace(dashRegex, self.separator+'-'+self.separator);
	}

	this.isValidName = function () {
	    return !!self.luName.length && self.isValidCompound();
	}

	this.addSemType = function () {
	    if (self.semType) {
		self.luInfo.semType.push(self.semType);
	    }
	};

	this.removeSemType = function (idx) {
	    self.luInfo.semType.splice(idx,1);
	};

	this.saveLU = function () {
	    console.log('saving', self.luName,'.',self.luPOS);
	};

	this.addComment = function (comment) {
	    var params = {
		type: 'lu',
		framename: self.frameName,
		luname: self.luInfo['@name'],
		comment: comment
	    };

	    luDataManager.addComment(params).then(function(res){
		self.luInfo.comments.push(res);
	    });
	};

	function getLUprop () {
	    var propPath = Array.prototype.slice.call(arguments);
	    var result = self.luInfo;

	    propPath.every(function (e, i, a) {
		if (result[e]) {
		    result = result[e];
		} else {
		    result = '';
		    return false;
		}
	    });

	    return result;
	};

	frameDataManager.frameData(this.frameName).then(function (result) {
	    self.frameInfo = result.data;
	});

	if (luName) {
	    luDataManager.luData(this.frameName, luName).then(function (result) {
		if (result.data) {
		    self.luInfo = result.data;
		}
	    });
	}
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
