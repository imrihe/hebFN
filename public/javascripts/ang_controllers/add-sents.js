
function AddSentsCtrl($scope, $routeParams,utils) {
    $scope.selectedLUName=$routeParams.luname;
    $scope.selectedLUShortName =$scope.selectedLUName.split(".")[0];
    $scope.selectedLUShortPos =$scope.selectedLUName.split(".")[1];

    $scope.selectedFrameName=$routeParams.framename;
    $scope.currentSentences=[];
    $scope.foundSentences=[];
    $scope.updateCurrentSents=function()
    {
        utils.CallServerGet("heb/ludata",
            {
                framename:$scope.selectedFrameName,
                luname:$scope.selectedLUName
            },
            function(out){
                $scope.currentSentences=out.sentences;
                $scope.$apply();
	    }
        );
    };
    $scope.updateCurrentSents();

    var obj = {
	data: {
	    luname: $scope.selectedLUName,
	    framename: $scope.selectedFrameName
	},
	sentence: {
	    action: "addtolu",
	    content: {}
	}
    };

    $scope.associateSentence = function(sent){
	obj.sentence.content = sent.fullSentence;
	console.log(obj);
	utils.CallServerPost("heb/addSentenceToLU", obj, function(out){
	    $scope.updateCurrentSents();
	    console.log(out);
	});
    };

    $scope.showLoader = true;
    utils.CallServerGet("external/exampleSentences",{lupos:$scope.selectedLUShortPos,luname:$scope.selectedLUShortName,diversify:false},function(out)
    {
        $scope.foundSentences=out;
        $scope.showLoader = false;
        $scope.$apply();

    });

    utils.CallServerGet("heb/getexmsentencebylu",
        {
            framename: "Accuracy", //$scope.selectedFrameName, TODO: remove stub
            luname: "תבע.v" //$scope.selectedLUName TODO: remove stub
        },        function(out)
        {
            $scope.correlatedSentences=out;
            $scope.$apply();
        });

     //remove the sentence from the lexical unit
    $scope.removeFromLu = function(ind) {
        var sentid = $scope.sentences[ind]['ID']
        $scope.packNSaveAnnotations();
        if (!confirm("Are you sure you want to delete this sentence from the LU? this action is unreversablbe")) {
	    return false;
	}

        utils.CallServerPost("heb/rmSentFromLu",
            {'framename': $scope.frame, 'luname':$scope.luname, sentenceid: sentid},
            function (out) {
                console.log("status: ",JSON.stringify(out))
                alert("the sentence was removed")
                $scope.getda
                $scope.$apply();
                $scope.getData()
            });
    };

    //mark the segmentation of the sentence as fault
    $scope.badSeg = function(ind){
        var sentid = $scope.sentences[ind]['ID'];
        console.log("removing sentene:", sentid, $scope.luname, $scope.frame);
        if (!confirm("Are you sure you want to mark this sentence as bad segmented? it will be deleted from all the lus and all it's annotations will be removed!")){
	    return false;
	}

        utils.CallServerPost("heb/markbadseg",
            {'framename': $scope.frame, 'luname': $scope.luname, sentenceid: sentid },
            function (out) {
                console.log("status: ",JSON.stringify(out));
                alert("the sentence was removed from DB and marked as bad segmented");
                $scope.$apply();
            });
    };

    $scope.getSentenceData = function(ind){
	var sentid = $scope.currentSentences[ind]['ID'];

	utils.CallServerGet("external/searchById", {id: sentid}, function(sent){
	    console.log(sent);
	    $scope.associateSentence(sent.sentence);
	});	
    };

}
