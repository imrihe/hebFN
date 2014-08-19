(function(){
    angular.module('hebFN.manageLUs', [
	'fnServices',
	'hebFN.englishFrame',
	'hebFN.commentsWidget'
    ]).
	controller('manageLU', manageLU);

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

	this.luName = function (name) {
	    if (name === undefined) {
		return getLUprop('@name').split('.')[0];
	    } else {
		self.luInfo['@name'] = name + '.' + self.luPOS();
	    }
	};

	this.luPOS = function (pos) {
	    if (!pos) {
		return getLUprop('@name').split('.').pop() || self.luInfo['@POS'] || 'v';
	    } else {
		self.luInfo['@POS'] = pos.toUpperCase();
		self.luInfo['@name'] = self.luName() + '.' + pos;
	    }
	};

	this.isCompound = function () {
	    var result = false;
	    
	    self.multiwordTypes.forEach(function (x) {
		result |= (self.luName().indexOf(x.sep) > -1);
	    });

	    return result;
	}

	this.transformName = function () {
	    self.multiwordTypes.forEach(function (x) {
		var sepRegex = new RegExp(x.sep+'+', 'g');
		var dashRegex = new RegExp(x.sep+'*-'+x.sep+'*', 'g');

		self.luName(self.luName().replace(sepRegex, self.separator));
		self.luName(self.luName().replace(dashRegex, self.separator+'-'+self.separator));
	    });
	    
	}

	this.isValidName = function () {
	    return !!self.luName().length && self.isValidCompound();
	}

	var headWordMark = '@';
	this.isValidCompound = function () {
	    return !self.isCompound() || self.luName().indexOf(headWordMark) > -1;
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
	    console.log('saving', self.luName());
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
})();
