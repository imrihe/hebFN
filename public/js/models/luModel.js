(function (angular) {
    angular.module('hebFN.models').
	factory('luDataService', luDataFactory);

    luDataFactory.$injector = ['$http'];

    function luDataFactory ($http) {
	  /*  saveLUURL = '//localhost:3003/heb/editlu',
	    addLUURL = '//localhost:3003/heb/frameLuAssociation',
	    ;*/

	return {
	    getLU: function (frameName, luName) { return new LuModel(frameName, luName); }
	};

	function LuModel (frameName, luName) {
	    var self = this;
	    
	    this.frameName = frameName;

	    this.addComment = addComment;
	    this.save = saveLU;

	    getLUData(frameName, luName).then(function (result) {
		angular.extend(self, result.data);

		var luParts = self['@name'].split('.');
		self.pos = luParts.pop();
		self.name = luParts.join('.');
	    });
	};

	function getLUData (frameName, luName) {
	    var url = '//localhost:3003/heb/lu';
	    var params = {
		framename: frameName,
		luname: luName
	    };

	    return $http.get(url, {
		params: params,
		responseType: 'json'
	    });
	};

	function addComment (comment) {
	    var url = '//localhost:3003/heb/addComment';
	    var params = {
		type: 'lu',
		framename: this.frameName,
		luname: this.name,
		comment: comment
	    };
	    
	    return $http.post(url, {
		params: params,
		responseTyep: 'json'
	    });
	};

	function saveLU (luData) {
	    var url = saveLUURL;

	    if (!luData._id) {
		url = addLUURL;
		luDate.action = 'add';
	    }

	    return $http.post(saveLUURL, {
		params: luData,
		responseTyep: 'json'
	    });
	};
    };
})(angular);
