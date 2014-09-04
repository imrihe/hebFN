(function (angular) {
    angular.module('hebFN.models').
	factory('luDataService', luDataFactory);

    luDataFactory.$injector = ['$http'];

    function luDataFactory ($http) {

	return {
	    getLU: function (frameName, luName) { return new LuModel(frameName, luName); }
	};

	function LuModel (frameName, luName) {
	    var self = this;
	    
	    this.frameName = frameName;
	    this.oldName = luName;
	    this.addComment = addComment;
	    this.save = save;
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
	    
	    if (luName) {
		getLUData(frameName, luName).then(function (result) {
		    if (result.data) {
			angular.extend(self, result.data);
		    } else {
			self['@name'] = luName;
			self.status = 'initial';
		    }

		    var luParts = self['@name'].split('.');
		    var pos = luParts.pop();
		    self['@POS'] = self['@POS'] || pos.toUpperCase();
		    self.name = luParts.join('.');
		});
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
