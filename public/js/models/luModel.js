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

	    if (luName) {
		getLUData(frameName, luName).then(function (result) {
		    angular.extend(self, result.data);
		    
		    var luParts = self['@name'].split('.');
		    // self.pos = luParts.pop();
		    self.name = luParts.join('.');
		});
	    }
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

	function save () {
	    var saveurl = '//localhost:3003/heb/editlu',
	        addurl = '//localhost:3003/heb/frameLuAssociation';

	    var url = saveurl;

	    var luName = this.name + "." + this['@POS'].toLowerCase();

	    params = {
                framename: this.frameName,
                luname: this.oldName,
		lupos: this['@POS'],
                definition: this.defenition,
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

	    return $http.post(url, {
		params: params,
		responseTyep: 'json'
	    });
	};
    };
})(angular);
