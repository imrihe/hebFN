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
	
	this.frameName = $routeParams.frame;
	this.luName = $routeParams.lu;

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
	this.luInfo = {comments: [{cBy: 'avi', cDate: new Date(), content: 'alskjaskldjas kljasdkaslkjasd klasjkasd'}]};

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
    }
})();
