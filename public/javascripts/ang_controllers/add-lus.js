var HashLU=function(pos,name)
{
    return String(pos)+"#"+String(name);
};

function AddLUsCtrl($scope, $filter, $routeParams,utils) {
    $scope.selectedFrameName=$routeParams.frame;
    $scope.selectedFrame=[];
    $scope.frameLus=[];
    $scope.selectedFrameHebLUs={};
    $scope.currLu = {};
    $scope.queryFields = ['word', 'lemma'];
    $scope.POSs={
        noun:"n",
        verb:"v", 
        adjective:"a",
        adverb:"adv",
        preposition:"prep",
	modal:"md",
        a: "" //empty option
    };

    $scope.frameComments = [];
    $scope.newComment = null;

    $scope.optionalWords =  [];

    utils.CallServerGet("eng/translations",
        {framename:$scope.selectedFrameName},
        function(out){
            $scope.frameLus=out;
            $scope.$apply();});

    $scope.refreshAll=function()
    {
        //$scope.hebLUsUpdating=true;
        utils.CallServerGet("heb/framedata",
        {framename:$scope.selectedFrameName},
        function(out){
            $scope.selectedFrame=out;
            var hlu=out.hebData.lexUnit
            if(hlu===undefined|| hlu===[])
            {
                $scope.selectedFrameHebLUs={};
            }
            else
            {
                var newDict={};
                for(var i=0;i<hlu.length;i++)
                {
                    var lu=hlu[i];
                    var pos=lu['@POS'].toLowerCase();
                    var name=lu['@name'].split(".")[0];
		    var sentenceCount = lu['sentenceCount']
                    newDict[HashLU(name,pos)]={pos:pos,name:name, count: sentenceCount};
                }
                $scope.selectedFrameHebLUs=newDict;


            }
            $scope.$apply();
            }); 
    };
    $scope.refreshAll();
          
    $scope.luTranslations=[];
    $scope.selectedEngLUIdx=-1;
    
    $scope.addHebLU=function(name,pos,sure,comment,isTranslated)
    {
        sure=true; //TODO - this is hard coded - fix the bug!! @asaf
        console.log("sure:", sure, "\n cond:", (sure && "add" || "query"))
        var data= {   framename:$scope.selectedFrameName,
            luname:name,
            lupos:pos,
            action:(sure && "add" || "query")

            };
        if(comment!==undefined && comment!=="")
        {
            data.comment=comment;
        }
        if(isTranslated && $scope.selectedEngLUIdx!==-1)
        {
            data.origluid=$scope.frameLus[ $scope.selectedEngLUIdx].luID;
            data.origluname=$scope.frameLus[ $scope.selectedEngLUIdx].name+"."+$scope.frameLus[ $scope.selectedEngLUIdx].pos.toLowerCase();
        }
        if( pos ===undefined|| pos ==="" ||
            name===undefined|| name==="")
        {
            return;
        }
        
        $scope.selectedFrameHebLUs[HashLU(name,pos)]={pos:pos,name:name};
        $('#add-modal').modal('hide')
        utils.CallServerPost("heb/frameLuAssociation", data,
        function(out){
            if(out.status!==undefined && out.status=="OK")
            {
                $scope.refreshAll();
            }
            });
    
                
    };
    $scope.removeHebLU=function(name,pos)
    {
       var data= {   framename:$scope.selectedFrameName,
            luname:name,
            lupos:pos,
            action:"delete"
            }; 
            
        delete $scope.selectedFrameHebLUs[HashLU(name,pos)];
        utils.CallServerPost("heb/frameLuAssociation", data,
        function(out){
        if(out.status!==undefined && out.status=="OK")
        {
            $scope.refreshAll();
        }
        });
    };
    $scope.updateLuTranslations=function(newIdx)
    {
        if($scope.frameLus==[])
        {
            return;
        }
        var newTranslations=[];
        $scope.selectedEngLUIdx=newIdx;
        $scope.currLu = $scope.frameLus[newIdx]
        for(var i=0;i<$scope.frameLus[newIdx].translation.length;i++)
        {
            var tr=$scope.frameLus[newIdx].translation[i];
            var trPos=tr.pos;
            for(var j=0;j<tr.vals.length;j++)
            {
                newTranslations.push({name:tr.vals[j],pos:$scope.POSs[trPos]});
            }
        }
        $scope.luTranslations=newTranslations;
    };
    
    $scope.setSelectedhebLU=function(name,pos)
    {
        $scope.selectedHebLU={name:name,pos:pos};
    }
    $scope.getSelectedHebLU=function()
    {
        return $scope.selectedHebLU;

        //return $scope.luTranslations[$scope.selectedHebLUIdx];
    };
    $scope.page = 1;
    $scope.foundSentences=-1;
    $scope.lastSentCall={};
    $scope.lastSentCallInProgress=false;

    $scope.loadAndInc = function(){
        $scope.page++;
        $scope.loadSentencesForSearch();
    }

    $scope.loadAndDec = function(){
        if ($scope.page > 1){
            $scope.page=Math.max(1,$scope.page-1);
            $scope.loadSentencesForSearch();
        }
    }
    $scope.loadFirst = function(){
        if ($scope.page > 1){
            $scope.page=1;
            $scope.loadSentencesForSearch();
        }
    }
    $scope.loadSentencesForSearch=function()
    {


        var diversify = $scope.noDiversify ? 'false' : 'low';
        var name=$scope.searchName;
        var pos=$scope.searchPos;
        var what=$scope.searchWhat;
        var page=$scope.page
	var optionals = $scope.optionalWords.map(function(x){return x.w});

        //if(pos===undefined||name===undefined||pos===""||name==="")
        if(name===undefined||name==="")
        {
            $scope.searchedSentences=[];
            return;
        }
        $scope.foundSentences=-1;
        if($scope.lastSentCallInProgress)
        {
            $scope.lastSentCall.abort();
        }
        $scope.lastSentCallInProgress=true;
        $scope.lastSentCall=utils.CallServerGet("external/exampleSentences",{pos:pos,text:name, field: what, page: page, diversify : diversify, optionals:optionals},function(out)
            {
		var finalSentences = [];
                for (var sent in out){
		    $scope.getSentenceCorr(out[sent]);
		    var txt = out[sent].text,
		        words = out[sent].fullSentence.words;

		    fltr = {}
		    fltr[what] = name;
		    var targetWord = $filter('filter')(words, fltr)[0];
		    if (targetWord) {
			out[sent].displayText = txt.replace(targetWord.word, '<span class="targetWord">'+targetWord.word+'</span>');
			finalSentences.push(out[sent]);
		    }
                    //get sent status from hebfn server and update
                }
		$scope.foundSentences=finalSentences;
                $scope.lastSentCallInProgress=false;
                $scope.$apply();
//                $('[title]').tooltip();

            });

    };


    $scope.getSentenceCorr = function(currSent){
        var lu = $scope.getSelectedHebLU();
        if (lu.name){
        var data  ={
            luname: lu.name + '.' + lu.pos.toLowerCase(),
            framename: $scope.selectedFrameName,
            sentid: currSent.id,
        }

        utils.CallServerGet("heb/getSentCorr", data,
            function(out){
                if (out){
                    currSent.status=out.status;
                    $scope.$apply();
                    if(out.status!==undefined && out.status=="OK")
                    {
                        $scope.refreshAll();
                    }

                }
            });
        }
    }
    $scope.searchSentencesIconClicked= function(name,pos)
    {
	$scope.page = 1;
        $scope.searchWhat="lemma";
	$scope.optionalWords = [];
        $scope.searchPos=pos?pos:"";
        $scope.searchName=name?name:"";
        $scope.setSelectedhebLU(name,pos);
        $scope.loadSentencesForSearch();
        $('#search-modal').modal();
    };
    $scope.addLuIconClicked=function(name,pos)
    {
        $scope.LuToBeAddedComment="";
        if(name && pos)
        {
            $scope.LuToBeAddedName=name;
            $scope.LuToBeAddedPos=pos;
            $scope.LuToBeAddedWasTranslated=true;
        }
        else
        {
            $scope.LuToBeAddedName="";
            $scope.LuToBeAddedPos="";
            $scope.LuToBeAddedWasTranslated=false;
        }
        $('#add-modal').modal();
    };
    $scope.newLUWasTranslated=false;

    
    //$scope.addingSeggustion=false;
    
   /* var addTooltip=function(elemId,iconClass,onDone)
    {
        $(".heb-lus").on("click","."+iconClass,function(){
            $(".add-lus-tooltip").hide();//hide other tooltips
            var pos=$(this).parent().parent().position();
            $("#"+elemId).css({
                position:"absolute", 
                display:"block",
                top:pos.top, 
                left: pos.left});
            if(onDone!== undefined)
            {
                onDone();
            }
            $scope.$apply();    
            });
          
        $(".add-lus-tooltip#"+elemId+" .icon-remove").on("click",function(){
            $("#"+elemId).hide()});
        
    };*/
    //addTooltip("sentences","icon-search",function(){$scope.loadSentencesForSelecteHebLU()});
    //addTooltip("add-heb-lus","icon-question-sign",function(){ $scope.addingSeggustion=false});
    //addTooltip("add-heb-lus","icon-plus-sign",function(){ $scope.addingSeggustion=true});
         
    $scope.newLUPos="";
    $scope.newLUName="";






    $scope.frameHist = [];
    $scope.getFrameHist = function(){
        utils.CallServerGet("heb/history",
            {framename: $scope.selectedFrameName},
            function(out){
                $scope.frameHist=out;
                $scope.$apply();});
    };

    $scope.getFrameHist();

    $scope.getDate = function(d){
        return (d.substring(0, d.indexOf('T')));
    }

    //$scope.histStrFunc = function () {return utils.createHistStr};
    //sleep(50)
    //$scope.histStr =  histStrFunc();

//    $('[title]').tooltip();

    $scope.setLuSentCorrelation  =function(sentid, status,text){
        //console.log(sentid,status)
       var lu = $scope.getSelectedHebLU();   //TODO - update if needed
        var data  ={
            luname: lu.name +'.'+ lu.pos.toLowerCase(),
            framename: $scope.selectedFrameName,
            sentid: sentid,
            status: status,
            text: text

        }

        utils.CallServerPost("heb/setSentCorr", data,
            function(out){
                if(out.status!==undefined && out.status=="OK")
                {
                    $scope.refreshAll();
                }
            });


    }

    $scope.ajaxresults = {};

    $scope.checkTranslation = function(trans){

        var transToCheck = trans.name+ '#'+trans.pos;
        var res = $scope.selectedFrameHebLUs[transToCheck];
        //console.log('trans is',res, trans)
        if (res) return true
        else return false
        //return false;

    }


    $scope.postComment = function(){
	var params = {
	    type: 'frame',
	    framename: $scope.selectedFrameName,
	    comment: $scope.newComment
	};
	$scope.newComment = null;

	utils.CallServerPost("heb/addcomment", params, function(res){
	    $scope.selectedFrame.hebData.comments.push(res);
	    $scope.$apply();
	});
    }

    $scope.addOptionalTerm = function() {
	$scope.optionalWords.push({w:''});
    }

    $scope.cleanUpTerms = function(idx) {
	if (!$scope.optionalWords[idx].w) {
	    $scope.optionalWords.splice(idx, 1);
	}
    }

    $scope.addSentenceIconClicked= function(name,pos) {
	$scope.setSelectedhebLU(name, pos);
	$scope.newSentenceGenre = "";
	$scope.newSentenceText = "";
        $('#add-sentence').modal();
    };

    $scope.addSentence = function(){
	var params = {
//	    preview: 'true',
//	    genre: $scope.newSentenceGenre,
	    text: $scope.newSentenceText
	};

	utils.CallServerPost("external/addSentence", params, function(res){
	    console.log(res);
	    $scope.setLuSentCorrelation(res['_id'], 'good', res['text']);
	});

	$('#add-sentence').modal('hide');
    }
}
