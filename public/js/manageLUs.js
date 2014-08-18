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

	this.frameInfo = {};
	this.luInfo = {'@name': luName};

	this.luName = function (name) {
	    if (!name) {
		return getLUprop('@name').split('.')[0];
	    } else {
		self.luInfo['@name'] = name + '.' + self.luPOS();
	    }
	};

	this.luPOS = function (pos) {
	    if (!pos) {
		return getLUprop('@name').split('.').pop();
	    } else {
		self.luInfo['@POS'] = pos.toUpperCase();
		self.luInfo['@name'] = self.luName() + '.' + pos;
	    }
	};

	this.addSemType = function () {
	    if (self.semType) {
		self.luInfo.semType.push(self.semType);
	    }
	};

	this.removeSemType = function (idx) {
	    self.luInfo.semType.splice(idx,1);
	};

	this.saveLU = function () {
	    
	};

	this.addComment = function (comment) {
	    var params = {
		type: 'lu',
		framename: self.frameName,
		luname: self.luInfo['@name']
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

	luDataManager.luData(this.frameName, luName).then(function (result) {
	    if (result.data) {
		self.luInfo = result.data;
	    }
	});
    }
})();
