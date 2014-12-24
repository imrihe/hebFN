(function (angular) {
    angular.module('hebFN.luSentences', [
	    'hebFN.models'
    ]).
	    controller('luSentences', sentences);

    sentences.$injector = ['$routeParams', '$http'];

    function sentences ($routeParams, $http) {
	    var self = this;

	    self.frameName = $routeParams.frame;
	    self.luName = $routeParams.lu;

        self.sentences = [];
        //	    self.luInfo = luDataService.getLU(self.frameName, $routeParams.lu);

        init();

        var obj = {
            data: {
	            framename: self.frameName,
	            luname: self.luName
	        },
	        sentence: {
	            action: "addtolu",
	            content: null
	        }
        };
        
	    self.toggleAcceptedSentence = function (sent) {
	        if (angular.isDefined(sent.associatedID)) {
                var ID = sent.associatedID;

                $http({
                    method: 'POST',
                    url: 'heb/rmSentFromLu', 
                    data: {
                        framename: self.frameName,
                        luname: self.luName,
                        sentenceid: ID
                    },
                    responseType: 'json'
                }).then(function (response) {
                    delete sent.associatedID; 
                });                
	        } else {
                $http.get('external/searchById',{
                    params: {
                        id: sent.esSentId
                    },
                    responseType: 'json'
                }).then(function (response) {
                    obj.sentence.content = response.data.fullSentence;
		            $http({
                        method: 'POST',
                        url: 'heb/addSentenceToLU',
                        data: obj,
                        responseType: 'json'
                    }).then(function (response) {
                        sent.associatedID = response.data.sentence.ID;
                    });
	            });
            }
	    };

	    function removeSentence () {
	        //var sent = self.luInfo.correlatedSentences.pop([self.selectedSentence])
	        //sent.reject(self.frameName, self.luName);

	        $('#remove-sentence').modal('hide');   
	    };

        function init () {
            $http.get('heb/getexmsentencebylu', {
                params: {
                    framename: self.frameName,
                    luname: self.luName
                },
                responseType: 'json'
            }).then(function (response) {
                var r = response.data;
                self.sentences = r;
            }).then(function () {
                $http.get('heb/ludata', {
                    params: {
                        framename: self.frameName,
                        luname: self.luName
                    },
                    responseType: 'json'
                }).then(function (response) {
                    var r = response.data.sentences;

                    for (var i in r){
                        for (var j in self.sentences){
                            if (self.sentences[j].esSentId == r[i].content.fullSentence.esId) {
                                self.sentences[j].associatedID = r[i].ID;
                            }
                        }
                    }
                });    
            });
        };

	    $('#remove-sentence').on('show.bs.modal', function (e){
	        $('#delete-button').off('click').on('click', function () {
		        removeSentence();
	        });
	    });
    };
})(angular);
