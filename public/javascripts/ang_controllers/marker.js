
function MarkerCtrl($scope, $window, $timeout,$routeParams,utils) {
    $scope.luname=$routeParams.lu;
    $scope.frame=$routeParams.frame;
    $scope.chosenTokens=[]; //changing variable - contains the curren selection of tokens in the curr sentence
    $scope.chosenSentence=0; //every time a sentence is being selected - that var reflects it
    $scope.sentences=[] ; //list of the sentences (row data)
    $scope.fes={}; //list of frame element, sorted by core\non-core
    $scope.nullInsts = ['CNI', 'DNI','INI']; //this list will be reflected to the options available for the user in order to select NI for certain FE
    $scope.NIAnnotations ={}; //this is a dynamic list of the current NI annotations for each sentence
    $scope.defNullVal={curr: {'Theme':'','Agent':''}};
    $scope.origAnnotations = {}; //saves copy of the original annotatios - for reverse the user changes
    $scope.annotations1 = {}; //this is the main list of the annotations (loaded in the beginning and being updated continuesly
    $scope.taggedToekns = {}; //performacne variable
    $scope.hours = 1.9; //the time before the edit-lu timeout will apply
    $scope.frameLU={}
    $scope.aquireLock = function(){
        utils.CallServerGet("heb/lulock",{'action': 'lock','framename': $scope.frame, 'luname':$scope.luname},function(out){
            console.log("out out out:",out);
        }   )
    }
    $scope.aquireLock();
    //console.log(history.back())
    //util function to extract nis from an annotation of a sentence
    $scope.getNIs = function(sent){
        return $.grep($scope.annotations1[sent]['FE'].label, function(obj){
            return obj.itype
        })
    };

    //util function - sort FES by core/non-core
    $scope.sortFes= function(fes){
        var core = [];
        var nonCore =[];
        for (obj in fes){ //"@coreType": "Core",
            //console.log(obj)
            if (fes[obj]['@coreType'] =='Core') core.push(fes[obj]);
            else  nonCore.push(fes[obj] );
        }

        return {core: core, nonCore: nonCore};
    }

    // load the annotations object for each sentence- in order to make everything simpler here..
    $scope.loadAnnotations = function(sent, anno){
        if (!sent['annotations'] || sent['annotations'].length == 0) return;
        //take the first annotations (always - the first one will be the valid one
        for (tag in sent['annotations'][0]){
            for (layer in sent['annotations'][0]['layer']){
                var lay = sent['annotations'][0]['layer'][layer];
                if (lay.name=='FE'){

                }else if (lay.name.toLowerCase() =='target'){
                }
            }
        }
    }


    //updadates the tagged tokens - by seperating between NIs and regular (this is for performance)
    $scope.updateTaggedTokens = function (){
        for (anno in $scope.annotations1){
            $scope.taggedToekns[anno] = {}
            for (label in $scope.annotations1[anno]['FE']['label']){
                for (tok in $scope.annotations1[anno]['FE'].label[label]['tokens']){
                    $scope.taggedToekns[anno][($scope.annotations1[anno]['FE'].label[label]['tokens'][tok])] = $scope.annotations1[anno]['FE'].label[label]['name'];
                }
            }
            for (label in $scope.annotations1[anno]['Target']['label']){
                for (tok in $scope.annotations1[anno]['Target'].label[label]['tokens']){
                    $scope.taggedToekns[anno][($scope.annotations1[anno]['Target'].label[label]['tokens'][tok])] =$scope.annotations1[anno]['Target'].label[label]['name'] ;
                }
            }
        }
    };

    //updates the NIsLis according to the currently tagged tokens in each sentence
    $scope.updateNIsList = function(){
        console.log("updating NIS list")
        /*for (var anno in $scope.annotations1){
         $scope.NIAnnotations[anno] = $.map($scope.getNIs(anno),function(obj) {return {itype: obj['itype'], name: obj['name']}}) ;
         } */
        for (var anno in $scope.annotations1){
            $scope.NIAnnotations[anno] = {};
            var currNis =$.map($scope.getNIs(anno),function(obj) {return {itype: obj['itype'], name: obj['name']}}) ;
            for (ni in currNis){
                $scope.NIAnnotations[anno][currNis[ni].name] = currNis[ni].itype;
            }
        }

    };

    //load the data from the server by calling API: "heb/ludata"
    $scope.getData = function () {
        console.log("heb/ludata",{'framename': $scope.frame, 'luname':$scope.luname})
        utils.CallServerGet("heb/ludata",{'framename': $scope.frame, 'luname':$scope.luname},function(out)
        {
            $scope.sentences=out['sentences'];
            $scope.annotations1 = out['luSentence']['annotations']

            for (sent in $scope.sentences){
                $scope.NIAnnotations[sent] = {};
            }

            $scope.updateTaggedTokens();
            $scope.updateNIsList();

            $scope.luSentence=out['luSentence']['rowData'];
            console.log('out:', out['frameLU'])
            $scope.frameLU=out['frameLU'];
            $scope.fes = $scope.sortFes( $scope.frameLU['FE'])
            //console.log("fes-before: ", JSON.stringify( $scope.frameLU['FE']))
            //console.log("fes: ", JSON.stringify( $scope.fes))
            $scope.origAnnotations = JSON.parse(JSON.stringify($scope.annotations1))
            $scope.$apply();
        });
    }

    //loads the page!
    $scope.getData();


    //load the FE element by name -returns the whole FE object from the frame data
    $scope.getFeByName = function(feName){
        return  $.grep($scope.frameLU['FE'], function(fe){
            return fe['@name'] == feName;
        });
    }


    $scope.getColor = function(color){
        return color;
    }

    //get the colors of the current FE (bg, fg)
    $scope.getFEColors = function(fe){
        if (fe == 'Target') return {color: 'white', background: 'black'};
        //$scope.frame
        var feObj= $scope.getFeByName(fe)[0];
        var resObj = {}
        resObj.color = feObj['@fgColor'][0]=='#' ? feObj['@fgColor'] : '#'+feObj['@fgColor']
        resObj.background = feObj['@bgColor'][0]=='#' ? feObj['@bgColor'] : '#'+feObj['@bgColor']
        return resObj;
        //else return
    }

    //function fires when a FE element is clicked - contains few validations (empty choice, duplicate values for token)
    $scope.tagTokens = function(fe){
        if ($scope.chosenTokens.length==0) return alert("please choose some tokens first")
        if ($scope.NIAnnotations[$scope.chosenSentence][fe]) {
            console.log("cant tag an NI tagged FE")
            alert('The FE is already tagged as NI, remove NI-tag first')
            return
        };
        //var tagObj = {name: fe};
        for (tok in $scope.chosenTokens){
            //$scope.debugArr.push($scope.chosenTokens[tok])
            if ($scope.isTagged1($scope.chosenTokens[tok], $scope.chosenSentence)) {
                alert('you cannot choose more than one FE for the same token (word)')
                return
            }
        }
        //if the FE is allready tagged in this sentence - we need just to add the chosen tokens to the list
        if ($scope.isTaggedFE(fe)) {
            var taggedFE = $.grep($scope.annotations1[$scope.chosenSentence]['FE']['label'], function(taggedObj){
                return taggedObj.name == fe;
            })
            taggedFE[0].tokens.push.apply(taggedFE[0].tokens,$scope.chosenTokens)
        }
        else $scope.annotations1[$scope.chosenSentence]['FE']['label'].push({name: fe, tokens: $scope.chosenTokens });
        //$scope.updateTaggedTokens()
        console.log("adding tokens to dataset:", JSON.stringify($scope.annotations1[$scope.chosenSentence]))
        $scope.chosenTokens=[];
    }

    $scope.tagTarget = function(fe){
        if ($scope.chosenTokens.length==0) return alert("please choose some tokens first")
        for (tok in $scope.chosenTokens){
            //$scope.debugArr.push($scope.chosenTokens[tok])
            if ($scope.isTagged1($scope.chosenTokens[tok], $scope.chosenSentence)) {
                alert('you cannot choose more than one FE for the same token (word)')
                return
            }
        }
        //if the FE is allready tagged in this sentence - we need just to add the chosen tokens to the list
        /*if ($scope.isTaggedFE(fe)) {
            var taggedFE = $.grep($scope.annotations1[$scope.chosenSentence]['Target']['label'], function(taggedObj){
                return taggedObj.name == fe;
            })
            taggedFE[0].tokens.push.apply(taggedFE[0].tokens,$scope.chosenTokens)
        } */
        //else
         $scope.annotations1[$scope.chosenSentence]['Target']['label']  =[{name: fe, tokens: $scope.chosenTokens }];
        //$scope.updateTaggedTokens()
        console.log("adding tokens to dataset:", JSON.stringify($scope.annotations1[$scope.chosenSentence]))
        $scope.chosenTokens=[];
    }


    //activated by clicking on a sentence from the sentences list
    $scope.selectSentence= function(sentNum){
        $scope.currSent = $scope.sentences[sentNum];
        $scope.chosenTokens=[]
        $scope.chosenSentence = sentNum;
        $scope.nullVal='';
    }


    //clears out the chosen tokens
    $scope.clearTokens = function(event){
        $scope.chosenTokens=[]
    }


    $scope.isTagged1 = function(ind, sentNum){
        //console.log(sentNum, $scope.taggedTokens)
        return $scope.taggedToekns[sentNum] && $scope.taggedToekns[sentNum].hasOwnProperty(ind)
    }


    //check if this FE is tagged in the current sentence (as NI or Regular tag)
    $scope.isTaggedFE=  function(fe){
        console.log("chosen sentntens: ",$scope.chosenSentence)
        console.log("chosen sentntens: ",JSON.stringify($scope.annotations1))
        var grepRes = $.grep($scope.annotations1[$scope.chosenSentence]['FE']['label'],function (obj){
            return obj.name == fe;
        })
        return !Array.isArray(grepRes) || grepRes.length !=0
    }


    //colors by token id in the given sentence
    $scope.getColorsByToken1 = function(ind, sentNum,isSpace){

        var style = {};

        if (!$scope.isTagged1(ind, sentNum)){
            //$scope.debugMsg="got null color+ "+ $scope.isTagged(1)
            style.color = 'black';
            style.background = 'white'
            return style;
            //return {color: 'black', background: 'white'}
        }
        else {
            return angular.extend(style, $scope.getFEColors($scope.taggedToekns[sentNum][ind]))

        }
    }


    //used in order to check if a sentence is chosen or not - and add a mark (class)
    $scope.isTaggedSent = function(ind){
        return !$.isEmptyObject($scope.annotations[ind])
    }


    //rmove the annotations of the listed tokens by given FE (if Fe is NI type, tokens is ignored
    $scope.removeTags = function(fe, tokens){
        //console.log("removing tags", Array.isArray(tokens), JSON.stringify(tokens));
        $scope.annotations1[$scope.chosenSentence]['FE']['label'] = $.grep($scope.annotations1[$scope.chosenSentence]['FE']['label'],
            function(taggedObj) {
                console.log("filtering object in remove: ", fe,":", taggedObj.name != fe)
                return taggedObj.name != fe;
            });
    }


    $scope.$watch('annotations1',function(bef, aft){
        console.log("annotations 1 was updated - updating chosen tokens")
        $scope.updateTaggedTokens();
        $scope.updateNIsList();
    }, true);


    //deletes all the annotations of the current sentence (reversable until save)
    $scope.deleteAnnotations = function(ind){
        var r = confirm("this will delete all the FE annotations of this sentence - continue?")
        if (r!=true) return;
        console.log("deleting sentence ", ind, "\n", JSON.stringify($scope.annotations1[ind]['FE']['label']))
        $scope.annotations1[ind]['FE']['label'] = [];
        $scope.annotations[ind] = {}
        console.log('delete NI result: ', JSON.stringify($scope.NIAnnotations[$scope.chosenSentence]))
        $scope.updateNIsList();
        console.log('delete NI result: ', JSON.stringify($scope.NIAnnotations[$scope.chosenSentence]))
    }

    $scope.right=false;
    $scope.left=false;
    $scope.start = -1;
    $scope.end = -1;
    //$scope.extendTo= -1;
    $scope.inProgress = false;


    $scope.selectToken=  function (tok) {
        if ($scope.chosenTokens.indexOf(tok) ==-1) $scope.chosenTokens.push(tok);
    }


    //stop selecting
    $scope.sealSelection= function(){
        if ($scope.inProgress) {
            $scope.inProgress = false;
        }
    };

    $scope.clear = function clear() {
        $scope.inProgress = false;
        $scope.start = -1;
        $scope.end = -1;
        /*$b.find('.selecting').removeClass('selecting');
         $b.find('.selected').removeClass('selected');
         $b.find('.selecting_left').removeClass('selecting_left');
         $b.find('.selecting_right').removeClass('selecting_right');
         $b.find('.selected_left').removeClass('selected_left');
         $b.find('.selected_right').removeClass('selected_right');*/
        //this.postStatus();
    };


    $scope.setStart = function setStart(ind) {
        $scope.clear();
        $scope.chosenTokens=[];
        $scope.start = ind;
        $scope.end = $scope.start;
        //$(cspans[this.start]).addClass("selecting");
        $scope.selectToken(ind); //class!!
        $scope.inProgress = true;
        //$scope.fixSelection();
    };

    $scope.filterToks = function(toks, startInd, endInd){
        //console.log('filtering...', $scope.chosenTokens)
        angular.element.grep($scope.chosenTokens, function(val, ind){
            return false;
        })



        return ;
        $.grep($scope.chosenTokens, function(elem, index){
            //console.log('filtering...', $scope.chosenTokens)
            return false;
            //return (elem >= Math.min(startInd, endInd) &&  elem <= Math.max(startInd, endInd))
        })
        //console.log("after filter = ",toks);
    }

    $scope.fixSelection = function(ind){
        //console.log('fixing selection', ind);
        $scope.direction = ($scope.end <= $scope.start) ? 1 : -1;
        $scope.filterToks($scope.chosenTokens, $scope.start, $scope.end);

    }

    //direction logic - extends or "decreases" the selection by directions logic
    $scope.extendTo= function(ind, a){

        if ($scope.inProgress) {
            $scope.chosenTokens=[]
            //console.log("expanding to : ",ind);
            $scope.end = ind;
            if ($scope.end > $scope.start) {
                for (var i = $scope.start; i<= $scope.end; i++){
                    $scope.selectToken(i);
                }
            } else {
                for (var i = $scope.end; i<= $scope.start; i++){
                    $scope.selectToken(i);
                }
            }
            //console.log("done - expanding to : ",$scope.chosenTokens);
            //$scope.fixSelection(ind)
        }
        //if (!a)  $scope.extendTo(ind, true);

    }

    //extend the selection once the mouse is clicked and entered to a new word span
    $scope.extendSelection = function(ind){
        $scope.extendTo(ind);
        return false;
    };


    //start selecting - fires when the mouse is clicked over a word in the chosen sentence
    $scope.startSelection = function(ind){
        if ($scope.inProgress) {
            $scope.extendSelection(ind)
        } else {
            $scope.setStart(ind)
        }
        return false;
    };


    //used in order to stop selecting  - freezes the current selected tokens (mouseup, leave text area)
    $scope.endSelection= function(ind){
        //$scope.end=ind;
        $scope.sealSelection()
        return false;
    };

    //used for selection classes (style)
    $scope.isRightWord = function(ind){
        //console.log("right word: ", Math.min.apply(Math, $scope.chosenTokens)==ind)
        return Math.min.apply(Math, $scope.chosenTokens) == ind;
    }

    //used for selection classes (style)
    $scope.isLeftWord = function(ind){
        //console.log("left word: ",  ind,Math.max.apply(Math, $scope.chosenTokens)==ind)
        return Math.max.apply(Math, $scope.chosenTokens) == ind;
    }




    //used for selection classes (style)
    $scope.isSelectedNew = function(ind) { return $scope.chosenTokens.indexOf(ind) !=-1}

    $scope.selectNullFe = function(feName, nullVal){


        //alert('is tagged- '+feName+'-' +$scope.isTaggedFE(feName))
        if ($scope.isTaggedFE(feName)) return alert("you can't tag NI for already tagged FE")
        else {
            if (nullVal==null){
                //console.log("null val setting to null")
                delete $scope.NIAnnotations[$scope.chosenSentence][feName]

            }
            else{
                $scope.NIAnnotations[$scope.chosenSentence][feName] = nullVal;
            }
        }
        // console.log("the selected null fe is:", feName, nullVal ,$scope.isTaggedFE(feName)) ;

    }

    //change/select NI for certain FE
    $scope.changeNI=function(value, fe){
        console.log("the values is:",fe, value, value==null);
        //alert("the values is: "+fe+ ' '+ value+ ' '+(value==null))
        //remove the FE attribute if the chosen is undefined
        if (value != 'null' && value != null) {
            $scope.annotations1
            if ($scope.isTaggedFE(fe)){
                console.log("changeNI: fe is tagged")

                //$scope.NIAnnotations[$scope.chosenSentence][fe] = value;
                console.log(JSON.stringify($scope.NIAnnotations))
                var currNITag = $.grep($scope.annotations1[$scope.chosenSentence]['FE']['label'], function(obj){
                    return obj.name ==fe;
                })
                currNITag['itype'] = value;
                $scope.removeTags(fe)
                $scope.annotations1[$scope.chosenSentence]['FE']['label'].push({name: fe, itype: value, tokens: []});
            }else{
                console.log("changeNI: fe is NOT tagged", JSON.stringify($scope.annotations1[$scope.chosenSentence]['FE']['label']))
                $scope.annotations1[$scope.chosenSentence]['FE']['label'].push({name: fe, itype: value, tokens: []});
                console.log("changeNI: fe is NOT tagged", JSON.stringify($scope.annotations1[$scope.chosenSentence]['FE']['label']))
            }

            console.log("done cahnging ni", JSON.stringify(currNITag))
        }

        else{
            $scope.removeTags(fe, [])
        }
    }


    //pack the annotations:
    //for each sentence create layerType {name, label}
    //each label contains:
    //  "name":String
    //tokens  - list of ids in the words array of the sentence
    //fgColor - derieved from the FE or TARGET
    //bgColor - derieved from the FE or TARGET
    //itype for core elements that are NI
    //feID (really?
    //result obj is in the form of: [{sentenceID,layer}]
    $scope.postResult =null;
    $scope.postAnnotations = function (){
        var equalAnnos = $scope.compareAnnotation();
        for (anno in equalAnnos){
            if (equalAnnos[anno]) delete $scope.annotations1[anno];
        }
        if (angular.equals($scope.annotations1, {})) {
            $scope.getData();
            return alert("no changes to save")
        }
        utils.CallServerPost("heb/createannotation",
            {'framename': $scope.frame, 'luname':$scope.luname, annotations: $scope.annotations1},
            function(out)
            {
                $scope.postResult=out;
                console.log("status: ",out.status)
                if(out.status !=undefined)
                {
                    $scope.postResult=out;
                    console.log("post result: ", JSON.stringify(out));
                    //$scope.updateHebLus();
                    alert("the changes have beed saved!")
                    $scope.$apply();
                }
                $scope.getData();
            });
    };

    //save all the annotations - it will run  over every previous annotation
    $scope.packNSaveAnnotations =function(){
        console.log("pack N save")
        return $scope.postAnnotations();

    };//packNsave

    $scope.$watch('chosenSentence', function(){
        if ($scope.chosenSentence) $scope.nis = $scope.getNIs($scope.chosenSentence);
    }, true)


    $scope.isNIFE =function(fe){
        return $scope.NIAnnotations[$scope.chosenSentence][fe]
    }

    //use this method in oreder to check if it is needed to disable NI tagging for specific sentence+ FE
    $scope.disableNITags = function(fe){
        return $scope.isTaggedFE(fe) && ! $scope.isNIFE(fe);
    }

    //load the original annotation - before the user's changes (per sentence)
    $scope.loadOrigAnno = function(){
        $scope.annotations1[$scope.chosenSentence] = JSON.parse(JSON.stringify($scope.origAnnotations[$scope.chosenSentence]));
    }

    //remove the sentence from the lexical unit
    $scope.removeFromLu = function(ind) {
        var sentid = $scope.sentences[ind]['ID']
        $scope.packNSaveAnnotations();
        if (!confirm("Are you sure you want to delete this sentence from the LU? this action is unreversablbe")) return
        "526cba948f6c842714000029"
        utils.CallServerPost("heb/rmSentFromLu",
            {'framename': $scope.frame, 'luname':$scope.luname, sentenceid: sentid},
            //{'framename': 'kaki1', 'luname':'הלך.v', sentenceid: '526cba948f6c842714000029' },
            function(out)
            {

                console.log("status: ",JSON.stringify(out))
                alert("the sentence was removed")
                $scope.getda
                $scope.$apply();
                $scope.getData()

            });

    }

    //mark the segmentation of the sentence as fault
    $scope.badSeg = function(ind){
            var sentid = $scope.sentences[ind]['ID']
        console.log("removing sentene:", sentid, $scope.luname, $scope.frame)
        if (!confirm("Are you sure you want to mark this sentence as bad segmented? it will be deleted from all the lus and all it's annotations will be removed!")) return
        "526cba948f6c842714000029"
        utils.CallServerPost("heb/markbadseg",
            //{'framename': $scope.frame, 'luname':$scope.luname, annotations: $scope.annotations1},
            {'framename': $scope.frame, 'luname': $scope.luname, sentenceid: sentid },
            function(out)
            {

                console.log("status: ",JSON.stringify(out))
                alert("the sentence was removed from DB and marked as bad segmented")
		$scope.$apply();
		$scope.getData();
            });

    }


    $window.onbeforeunload = function (event) {

        var message = 'all unsaved changes will be lost, do you want to continue? ' +
            '\n(if you want to save your changes - cancel and click \'save all\')';
        if (typeof event == 'undefined') {
            event = window.event;
        }
        if (event) {
            event.returnValue = message;
        }
        if ( /Firefox[\/\s](\d+)/.test(navigator.userAgent) && new Number(RegExp.$1) >= 4) {
            alert(message);
        }
        return message;
    }


    $scope.doSomething = function(ev){
        alert("i did swipe!!")
        console.log('swipe event: ',ev)
        //,ng-swipe-left="doSomething($event)"  - this is the trigger

    }

    $scope.compareAnnotation = function(origAnno, newAnno){
        res = {}
        for (sent in $scope.annotations1){
            //console.log('sentence num', sent,"is equeal?", angular.equals($scope.annotations1[sent], $scope.origAnnotations[sent]) )
            res[sent] = (angular.equals($scope.annotations1[sent], $scope.origAnnotations[sent]))
        }
        return res;
        //for each FE in new - check if it exists in 'old' and if it does - compare the tokens

    }

    $scope.defineTimeout = function (){
        $timeout(function(){alert("your time for editing this lu will expire soon, please save your changes. " +
            "\n if you want to continue working on this LU please click 'I Need More Time' button" +
            "\n after the time will expire you might bot be able to save the changes")}, $scope.hours*60*60*1000)
    }

    $scope.defineTimeout();

    $scope.keyup=function(event){
        //alert("got key up!!")
        //console.log(event)

    }

    $(document).keyup(function (e) {
        if (e.which != 27) return;
        //alert("this is a jquery keyup")
        //console.log("which key",e.which)
        $scope.clearTokens()
        $scope.$apply()
    });

    $scope.isMouseOver= function(){
        return false; //TODO
    }


    $scope.analWord = function(word){
        //console.log("anal word")
        if (word['special'] && word['specTrans'][0] != '*' ) return ('{'+ word['specTrans']+'}')
        else if (!word['special']) return word['word']
    }

}
