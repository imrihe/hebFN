(function(angular) {
    'use strict';

    angular.module('hebFN.annotate', [
	    'hebFN.englishFrame'    
    ]).
        controller('annotator', annotator);

    annotator.$injector = ['$routeParams', '$http', '$sce'];

    function annotator ($routeParams, $http, $sce) {
        var self = this;
        
        self.frameName = $routeParams.frame;
        self.luName = $routeParams.lu;
        self.sentences = [];
        self.annotations = [];
        self.NIs = [];
        self.lu = {};
        
        var selected = 0;
        var raw_sentences = [];
        var old_annotations = [];
        var selection = null;
        
        lock();
        init();
        
        self.select = function (index) {
            selected = index;

            self.activeSentence = raw_sentences[selected].content.fullSentence.words.slice(0);

            updateAnnotations();
        };

        self.selected = function (index) {
            return angular.isDefined(index) ? selected == index : selected;
        };

        self.isSpecialWord = function (w) {
            return w.match(/\*\w+\*/);
        };

        self.removeAnnotation = function (index, keepNI) {
            
            var ann = self.annotations[selected].FE.label.splice(index, 1)[0];
            
            for (var i in ann.tokens) {
                self.activeSentence[ann.tokens[i]].style = {};
            }

            if (!keepNI && ann.itype) {
                delete self.NIs[selected][ann.name];
            }
            
            updateAnnotations();
        };

        self.removeTarget = function (index) {
            
            var ann = self.annotations[selected].Target.label.splice(index, 1)[0];
            
            for (var i in ann.tokens) {
                self.activeSentence[ann.tokens[i]].style = {};
            }
            
            updateAnnotations();
        };

        self.removeAll = function () {
            for (var i = self.annotations[selected].FE.label.length-1; i >= 0; i--) {
                self.removeAnnotation(i);
            }

            for (var i = self.annotations[selected].Target.label.length-1; i >= 0; i--) {
                self.removeTarget(i);
            }
        };

        self.reset = function () {
            init();
        };

        self.save = function () {
            var annotations = $.map(self.annotations, function(x) {return x});
            /*.
              filter(function (v, i, _) {
              return !angular.equals(v, old_annotations[i]);
              });
              var annotations = self.annotations;*/

            console.log(annotations);

            if (annotations.length) {
                $http({
                    url: 'heb/createannotation',
                    method: 'POST',
                    data: {
                        framename: self.frameName,
                        luname: self.luName,
                        annotations: annotations
                    },
                    responseType: 'json'
                }).success(function (response) {
                    alert('saved!');
                });
            } else {
                alert('No changes to save');
            }
        };

        self.removeSentence = function (index) {           
            if (confirm("Are you sure you want to remove this sentence form this LU?")){
                self.save();
                $http({
                    method: 'POST',
                    url: 'heb/rmSentFromLu',
                    data: {
                        framename: self.frameName,
                        luname: self.luName,
                        sentenceid: raw_sentences[index].ID
                    },
                    responseType: 'json'
                }).success(function(response) {
                    alert('the sentence was removed');
                    init();
                });
            }
        };

        self.annotate = function (fe) {
            if (self.NIs[selected][fe.name]) {
                return false;
            }

            var tokens = calcTokens()
            
            if (!tokens.length){
                return;
            }
            
            removeTokenTag(selected, tokens);

            var annotation = {};

            annotation.name = fe.name;
            annotation.tokens = tokens;
            
            $('.annotation-selection').removeClass('annotation-selection');

            self.annotations[selected].FE.label.push(annotation);
            selection = null;

            updateAnnotations();
        };

        self.updateNI = function (fe) {
            var value = self.NIs[selected][fe];
            var sent = self.annotations[selected];
 
            var e = 0;
            while (e < sent.FE.label.length) {
                if (sent.FE.label[e].name === fe) {
                    self.removeAnnotation(e, true);
                } else {
                    e++;
                }
            }

            if (value) {
                sent.FE.label.push({name: fe, itype: value, tokens: []});
            }

            updateAnnotations();
        };

        self.setTarget = function () {
            var tokens = calcTokens()
            
            if (!tokens.length){
                return;
            }
            
            removeTokenTag(selected, tokens);

            var annotation = {};

            annotation.name = 'Target';
            annotation.tokens = tokens;

            $('.annotation-selection').removeClass('annotation-selection');

            self.annotations[selected].Target.label.push(annotation);
            selection = null;

            updateAnnotations();
        };

        function removeTokenTag (sentence, tokens) {
            if (!angular.isArray(tokens)) {
                tokens = [tokens];
            }

            var ann = self.annotations[sentence];

            tokens.forEach(function (t) {
                for (var type in ann) {
                    var addition = undefined;
                    for (var i in ann[type].label) {
                        var label = ann[type].label[i];
                        var idx = label.tokens.indexOf(t);
                        if (idx >= 0) {
                            var rest = label.tokens.splice(idx, label.tokens.length - idx);
                            rest.shift();

                            if (rest.length) {                            
                                addition = {name: label.name, tokens: rest};
                            }
                            
                            if (!label.tokens.length) {
                                ann[type].label.splice(i, 1);
                            }

                            break;
                        }
                    }

                    if (angular.isDefined(addition)) {
                        ann[type].label.push(addition);
                    }
                }
            });
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

        function lock() {
            $http.get('heb/lulock', {
                params: {
                    action: 'lock',
                    framname: self.frameName,
                    luname: self.luName
                }
            })
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

        $("#annotation .panel-body").on('mouseup', function () {
            $('.annotation-selection').removeClass('annotation-selection');

            var sel = window.getSelection();
            if (sel.toString()){
                var startParent = sel.anchorNode.parentElement;
                var endParent = sel.focusNode.parentElement;

                var startToken, endToken;
                var startOut = false, endOut = false;

                if (startParent.id) {
                    startToken = parseInt(startParent.id.replace('s', ''));
                } else {
                    startToken = parseInt(sel.anchorNode.previousSibling.id.replace('s', ''));
                    startOut = true;
                }

                if (endParent.id) {
                    endToken = parseInt(endParent.id.replace('s', ''));
                } else {
                    endToken = parseInt(sel.focusNode.previousSibling.id.replace('s', ''));
                    endOut = true;

                }

                if (endToken < startToken) {
                    var swap = endToken;
                    endToken = startToken;
                    startToken = swap;

                    startToken = endOut ? startToken + 1 : startToken;
                } else if (startToken < endToken){
                    startToken = startOut ? startToken + 1 : startToken;
                }

                window.getSelection().removeAllRanges();

                for (var i = startToken; i <= endToken; i++) {
                    $('#s'+i).addClass('annotation-selection');
                }
            }
        });
    };
})(angular);
