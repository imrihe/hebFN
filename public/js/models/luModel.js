(function (angular) {
    angular.module('hebFN.models').
	factory('luDataService', luDataFactory);

    luDataFactory.$injector = ['$http'];

    function luDataFactory ($http) {

	return {
	    getLU: function (frameName, lu) { return new LuModel(frameName, lu); }
	};

	function LuModel (frameName, lu) {
	    var self = this;
	    
	    this.frameName = frameName;
	    this.addComment = addComment;
	    this.save = save;
	    this.remove = remove;
	    this.getSentenceLUCorrelation = getCorrelation;
	    
	    Object.defineProperties(this, {
		pos: {
		    get: function () {
			return self['@POS'] ? self['@POS'].toLowerCase() : ''; 
		    },
		    set: function (newVal) { 
			self['@POS'] = newVal.toUpperCase(); 
		    }
		}
	    });
	    
	    if (typeof lu === typeof "") {
		this.oldName = lu;
		getLUData(frameName, lu).then(function (result) {
		    if (result.data) {
			angular.extend(self, result.data);
		    } else {
			self['@name'] = lu;
			self.status = 'initial';
		    }
		});
	    } else if (typeof lu === typeof {}) {
		this.oldName = lu['@name'];
		angular.extend(self, lu);
	    }

	    if (self['@name']) {
		var luParts = self['@name'].split('.');
		var pos = luParts.pop();
		self['@POS'] = self['@POS'] || pos.toUpperCase();
		self.name = luParts.join('.');
	    }
	};

	function getLUData (frameName, luName) {
	    var url = '/heb/lu';
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
	    var url = '/heb/addComment';
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

	function remove () {
	    var url = '/heb/frameLuAssociation';

	    var luName = this.name + "." + this['@POS'].toLowerCase();

	    params = {
                framename: this.frameName,
                luname: this.name,
		lupos: this['@POS'].toLowerCase(),
		action: 'delete'
            };

	    return $http({
		method: 'POST',
		url: url,
		data: params,
		responseType: 'json'
	    });
	};

	function save () {
	    var saveurl = '/heb/editlu',
	        addurl = '/heb/frameLuAssociation';

	    var url = saveurl;

	    var luName = this.name + "." + this['@POS'].toLowerCase();

	    params = {
                framename: this.frameName,
                luname: this.oldName,
		lupos: this['@POS'],
                definition: this.definition,
                status: this.status,
		lemma: '',
                incoFe: this['@incorporatedFE']
            };

	    if (!this._id) {
		url = addurl;
		params.luname = luName;
		params.action = 'add';
	    } else if (this.oldName !== luName) {
		params.lunameNew = luName;
	    }

	    return $http({
		method: 'POST',
		url: url,
		data: params,
		responseType: 'json'
	    });
	};

	function getCorrelation (sentence_id) {
	    var url = '/heb/getSentCorr';
	    var params = {
		luname: this.oldName,
		framename: this.frameName,
		sentid: sentence_id
	    };	    

	    return $http.get(url, {
		params: params,
		responseType: 'json',
		cache: true
	    });
	};
    };
})(angular);
