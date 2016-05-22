(function(angular) {
    'use strict';

    angular.module('hebFN.annotate').
        controller('annotationViewer', viewer);

    viewer.$injector = ['$routeParams', '$http', '$sce'];

    function viewer ($routeParams, $http, $sce) {
        var self = this;
        
        self.frameName = $routeParams.frame;
        self.luName = $routeParams.lu;
        self.sentences = [];
        self.annotations = [];
        self.NIs = [];
        self.lu = {};
        
        var raw_sentences = [];
        var old_annotations = [];
        var selected = 0;
        var selection = null;
        
        init();

        self.select = function (index) {
            selected = index;

            self.activeSentence = raw_sentences[selected].content.fullSentence.words.slice(0);

            updateAnnotations();
        };

        self.isSpecialWord = function (w) {
            return w.match(/\*\w+\*/);
        };

        function updateAnnotations () {
            var sentences = [];

            for (var i in self.annotations) {
                var tokens = raw_sentences[i].content.fullSentence.words;

                var annotationSet = self.annotations[i].FE.label.
                    concat(self.annotations[i].Target.label).
                    sort(function (a, b) {
                        if (a.tokens[0] < b.tokens[0] || b.itype) return -1;
                        else if (a.tokens[0] > b.tokens[0] || a.itype) return 1;
                        else return 0;
                    });

                var sentence = []
                var ann = 0;
                var annotation = annotationSet[ann];
                for (var k in tokens) {
                    var v = tokens[k].word;

                    if (v.match(/\*\w+\*/)) {
                        v = '';
                    }

                    if (angular.isDefined(annotation)){
                        var colors = self.getColors(annotation.name);

                        if (self.selected(i) && k >= annotation.tokens[0] && k <= annotation.tokens[annotation.tokens.length-1]){
                            
                            self.activeSentence[k].style = {
                                'background-color': '#'+colors[0],
                                'color': '#'+colors[1]
                            };
                        }

                        if (k == annotation.tokens[0]) {
                            v = '<span style="background-color:#'+colors[0]+'; color:#'+colors[1]+'">'+v;
                        } 
                        
                        if (k == annotation.tokens[annotation.tokens.length-1]) {
                            v = v+'</span>';
                            annotation = annotationSet[++ann];
                        }
                    }

                    sentence.push(v);
                }

                sentences.push($sce.trustAsHtml(sentence.join(' ')));
            }

            self.sentences = sentences;
        };

        self.getColors = function (name) {
            for (var i in self.fes.core) {
                var fe = self.fes.core[i];
                if (fe.name === name) {
                    return [
                        fe.bgcolor,
                        fe.fgcolor
                    ];
                }
            }

            for (var i in self.fes.nonCore) {
                var fe = self.fes.nonCore[i];
                if (fe.name === name) {
                    return [
                        fe.bgcolor,
                        fe.fgcolor
                    ];
                }
            }

            return ['000', 'fff'];
        };

        self.computeStyle = function (name) {
            var colors = self.getColors(name);
            return {
                'background-color': '#'+colors[0],
                'color': '#'+colors[1]
            };
        };

        function calcTokens () {
            return $('.annotation-selection').
                map(function (_, x) {return parseInt(x.id.replace('s', ''))}).
                toArray();
        };

        function init () {
            self.lus = $http.get('heb/ludata', {
                params: {
                    framename: self.frameName, 
                    luname:self.luName
                }, 
                responseType: 'json'
            }).then(function (response) {
                var r = response.data;
                raw_sentences = r.sentences;
                old_annotations = r.luSentence.annotations;

                self.annotations = $.map(r.luSentence.annotations, function(x) {return x}).
                    map(function (x) {
                        x.Target.label = x.Target.label.filter(function (y) {
                            return y.tokens.indexOf(-1) < 0;
                        });
                        return x;
                    });

                self.NIs = self.annotations.map(function (x) {
                    var nis = {};
                    for (var i in x.FE.label) {
                        var y = x.FE.label[i];
                        if (angular.isDefined(y.itype)){
                            nis[y.name] = y.itype;
                        }
                    }
                    return nis;
                });

                self.fes = {
                    core: r.frameLU.FE.map(function (x) {
                        if (x['@coreType'] === 'Core'){
                            return {
                                name: x['@name'],
                                bgcolor: x['@bgColor'],
                                fgcolor: x['@fgColor']
                            }
                        }
                    }).filter(function (x) {return !angular.isUndefined(x)}),
                    nonCore: r.frameLU.FE.map(function (x) {
                        if (x['@coreType'] !== 'Core'){
                            return {
                                name: x['@name'],
                                bgcolor: x['@bgColor'],
                                fgcolor: x['@fgColor']
                            }
                        }
                    }).filter(function (x) {return !angular.isUndefined(x)})
                };
		self.select(0);
            });
        }
    };
})(angular);
