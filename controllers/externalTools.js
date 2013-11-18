/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 9/1/13
 * Time: 6:39 PM
 * To change this template use File | Settings | File Templates.
 */

printModule("controllers/externalTools");

var morphServer = 'http://www.cs.bgu.ac.il/~nlpproj/demo/tag.php';
//var dependencyParserServer = 'http://www.cs.bgu.ac.il/~yoavg/depparse/parse';
var dependencyParserServer = 'http://localhost:8081/parse';
var searchEngineServer = 'http://elhadad2:35005/';
var searchEngineServer2 = 'http://localhost';
var handleHttpResults = require('../tools/utils.js').handleHttpResults;
var util = require('../tools/utils.js');

var request = require('request');
exports.getMorph = function(req,res) {
    console.log("DEBUG: handling get-morph post request");
    console.log("the request body is:", JSON.stringify(req.body));
    //res.redirect(hp+"try");
    //req.body.json='on'; //set the json on - no matter what the other fields are TODO - fix this

    request.post(
        morphServer,
        { form: req.body },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("result from morph analyzer: ",typeof(body));
                res.charset = 'utf-8';

                if (req.body.json && req.body.json=='on'){
                    var resStr =body.substring(0, body.length - 3);
                    var resStrObj  = JSON.parse(resStr)[0];
                    console.log(JSON.parse(resStr));
                    var resultObj ={'response': resStrObj , 'sentence': [], 'segmented': []};
                    for (var i= 0; i<resStrObj.length; i++){
                        resultObj['sentence'].push(resStrObj[i]['form']);
                    }
                    for (var i= 0; i<resStrObj.length; i++){
                        if (resStrObj[i]['pref']) resultObj['segmented'].push(resStrObj[i]['pref']['form']);
                        resultObj['segmented'].push(resStrObj[i]['base']['form']);
                        if (resStrObj[i]['suff']) resultObj['segmented'].push(resStrObj[i]['suff']['form']);
                    }

                    res.send(resultObj);  //in the end of the response we have 'on' for some reason..
                }
                else res.send(body);
            }
        } );
};



exports.getDepParse2 = function(req,res) {
    console.log("DEBUG: handling getDepParse post request");
    console.log("the request body is:", req.body);
    //res.redirect(hp+"try");
    //req.body.json='on'; //set the json on - no matter what the other fields are TODO - fix this
    request.post(
        dependencyParserServer,
        { form: req.body },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("result from Yoav-dependency parser: ",body);
                return res.send(body) //TODO
                var splitted = body.split("\n");
                res.charset = 'utf-8';
                console.log("splitted\n:", splitted);
                newSplitted = [];
                var tmp;
                var resObj;
                resArr =[];
                //turn the returned text into JSON - TODO - abstract via external function
                for (var i = 0; i<splitted.length; i++){
                    newSplitted.push(splitted[i].split('\t'));
                    tmp =splitted[i].split('\t');
                    //console.log('tmp', tmp);
                    //console.log('tmp',tmp[8]);
                    resObj = {
                        id: tmp[0],
                        form: tmp[1],
                        lemma: tmp[2],  //always '_'
                        CPOSTAG: tmp[3],
                        POSTAG: tmp[4],
                        FEATS: tmp[5],
                        HEAD: tmp[6],
                        DEPREL: tmp[7],
                        PHEAD: tmp[8], //always '_'
                        PDEPREL: tmp[9] //always '_'
                    };
                    resArr.push(resObj);
                }
                //console.log("new spliotted: \n",resArr);
                wordsStr = "";
                for (word in resArr){
                    console.log(resArr[word]['word']);
                    if (resArr[word]['word']) wordsStr = wordsStr +" "+ resArr[word]['word'];
                }
                res.render('depParseResult.jade',{"result": resArr, "wordsStr":wordsStr});
            }
        }
    )
};

//receives an affix and return the translation
//for *prp* gen=M, number=S, person=1 - return שלי
var suffOptions = {
    'm-s-1': 'שלי',
    'm-s-2': 'שלך',
    'm-s-3': 'שלו',

    'f-s-1': 'שלי',
    'f-s-2': 'שלך',
    'f-s-3': 'שלה',

    'm-p-1': 'שלנו',
    'm-p-2': 'שלכם',
    'm-p-3': 'שלהם',

    'f-p-1': 'שלנו',
    'f-p-2': 'שלכן',
    'f-p-3': 'שלהן'

}
function transAffix(word){
    console.log("translating affix: ", word['word'])

    switch (word['word']){
        case '*PRP*':
            var comp  = word['gender'] + '-'+word['number']+'-' + word['person']
            console.log("translation result - *PRP*:",comp, suffOptions[comp] )
            return suffOptions[comp];
            break
        //case '*DEF*': return ''
        case '*DEF*':
            return 'ה';
            break
        default: return word['word']
    }


}
function conllWordToJson(word){
    console.log(word=="")
    var feats = word[5].split('|');
    var featsObj= {};
    if (feats[0] != '_'){
        for (f in feats){
            featsObj[feats[f].split('=')[0]] = feats[f].split('=')[1].toLowerCase()
        }
    }
    var jsonWord = {
        //basic morphological data:
        ID: word[0],
        "word": word[1],
        "lemma": word[2],
        "cpos" : word[3],
        "pos": word[4],
        //"prefix": String,
        //"base": String,
        //"suffix": String,
        //dependency related data:
        "head" : word[6],
        "deprel": word[7],
        "Phead" : word[8],
        "pdeprel": word[9],

        //FEATS
        "gender": featsObj['gen'] || '_',
        "number": featsObj['num'] || '_',
        "construct":  featsObj['cons'] || '_',
        "polarity":  featsObj['pol'] || '_',
        "person":featsObj['per'] || '_',
        "tense": featsObj['tense'] || '_',
        //"def": Boolean,
        "binyan" : featsObj['binyan'] || '_'
        //"otherFeats" : String,
    }

    if (jsonWord['pos'] == 'DEF') jsonWord['def']= true;
    else jsonWord['def']= false;

    console.log("regular expression mathc:", new RegExp(/^\*.+\*/).exec(jsonWord['word']), jsonWord['word'])
    if (new RegExp(/^\*.+\*/).exec(jsonWord['word']) ) {
        jsonWord['special']= true;
        jsonWord['specTrans'] = transAffix(jsonWord);
    }
    else jsonWord['special']= false;


    //"height": Number,
    ///"pardist": Number,
      //  "parpos": String,
        //"parword": String
    //FEATS-end

    return jsonWord;
}

function countSentenceLength(words){
    var counter=0;
    for (word in words ){
        if (words[word]['ID'].substr(words[word]['ID'].indexOf('.')+1) =='0') counter= counter +1;
    }
    return counter;
}

function linearizeSentence2(words){
    var txt=[];
    for (word in words ){
        if (words[word]['special'] && words[word]['specTrans'][0] != '*' ) txt.push('{'+ words[word]['specTrans']+'}')
        else if (!words[word]['special']) txt.push(words[word]['word'])
        //if (words[word]['ID'].substr(words[word]['ID'].indexOf('.')+1) =='0') counter= counter +1;
    }
    return txt.join(' ');

}
//recieves single sentence of conll  - returns json form by WordType as described in the schemeslibrary
function conll2006ToJson(conll){
    var sentence= {};
    var lines = conll.split("\n");
    var splittedLines = []
    for (line in lines ){
        if (line != ''){
            splittedLines.push(lines[line].split('\t'));
        }
    }
    splittedLines = _.filter(splittedLines,function (obj) {return obj !=""})
    for (word in splittedLines){
        if (splittedLines[word] != ""){
            console.log("sending word: ", splittedLines[word])
            splittedLines[word] = conllWordToJson(splittedLines[word])
        }
        else console.log("not sending word: ", splittedLines[word])
    }
    var words = splittedLines;
    sentence['words'] =words;
    sentence['valid']= true;
    console.log(_.filter(words, function (word){ return word['word']=='*DEF*'}))
    sentence['text'] = util.linearizeSentence2(words);
    sentence['sentenceProperties']= {
        length:     words.length,
        wordsNum:   countSentenceLength(words)

        //TODO: add these fields:
        //     "height" :Number,
        //        "root_location" :Number,
        //        "root_pos" : String,
        //      "pattern" :  String
    }

    return sentence;



}

function parseText(text, cb) {
    console.log("DEBUG: handling getDepParse post request");
    console.log("the request body is:", text);
    //res.redirect(hp+"try");
    //req.body.json='on'; //set the json on - no matter what the other fields are TODO - fix this
    request.post(
        dependencyParserServer,
        { form: {text: text} },
        function (error, response, body) {
            //return cb(null,body)
            if (!error && response.statusCode == 200) {
                //console.log("result from Yoav-dependency parser: ",body);

                return cb(null, conll2006ToJson(body)) //TODO


                /*var splitted = body.split("\n");
                res.charset = 'utf-8';
                console.log("splitted\n:", splitted);
                newSplitted = [];
                var tmp;
                var resObj;
                resArr =[];
                //turn the returned text into JSON - TODO - abstract via external function
                for (var i = 0; i<splitted.length; i++){
                    newSplitted.push(splitted[i].split('\t'));
                    tmp =splitted[i].split('\t');
                    //console.log('tmp', tmp);
                    //console.log('tmp',tmp[8]);
                    resObj = {
                        id: tmp[0],
                        form: tmp[1],
                        lemma: tmp[2],  //always '_'
                        CPOSTAG: tmp[3],
                        POSTAG: tmp[4],
                        FEATS: tmp[5],
                        HEAD: tmp[6],
                        DEPREL: tmp[7],
                        PHEAD: tmp[8], //always '_'
                        PDEPREL: tmp[9] //always '_'
                    };
                    resArr.push(resObj);
                }
                //console.log("new spliotted: \n",resArr);
                wordsStr = "";
                for (word in resArr){
                    console.log(resArr[word]['word']);
                    if (resArr[word]['word']) wordsStr = wordsStr +" "+ resArr[word]['word'];
                }
                res.render('depParseResult.jade',{"result": resArr, "wordsStr":wordsStr});  */
            }
        }
    )
};

exports.parseText = parseText;

exports.getDepParse = function(req, res){
    console.log("DEBUG: getDepParse");
    parseText(req.param('text'),handleHttpResults(req,res));
}

/**serach engine request
 *
 * @param req
 * @param res
 */
var url =require('url');
var http = require('http');
searchEngineServer = 'elhadad2';//'localhost';
//var q = '/HBCTPWeb/search?db=haaretz&from=1&to=2&diversity=false&query=$w.word="ילד"%20;%20$w';
//var q = '/HBCTPWeb/search?db=haaretz&from=1&to=2&diversity=false&query=$w.word="ילד"%20;%20$w'
//var q = '/HBCTPWeb/search?db=haaretz&from=1&to=2&diversity=false&query=$w.word="ילד" ; $w';
//var q  ="/HBCTPWeb/search?db=haaretz&from=1&to=2&diversity=false&query=$w.word=\"ילד\"%20;%20$w";
//var q  ="/HBCTPWeb/search?db=haaretz&from=1&to=30&diversity=false&query=$w.pos=\"verb\"%20;%20$w";
http://localhost:5005/HBCTPWeb/search?db=haaretz&from=1&to=2&diversity=false&query=$w.word=%22%D7%99%D7%9C%D7%93%22%20;%20$w
                    //HBCTPWeb/search?db=test2&from=1&to=30&diversity=false&query= $w.word=%22%D7%99%D7%9C%D7%93%22%20;%20$w
//q  ="/HBCTPWeb/search?db=haaretz&from=1&to=30&diversity=false&query=$w.word=$w.pos=\"noun\"%20;%20$w"
 //q='HBCTPWeb/search?db=haaretz&from=1&to=2&diversity=false&query=$w.word=%22%D7%99%D7%9C%D7%93%22%20;%20$w';
//var q = 'HBCTPWeb/search?db=test&from=1&to=2&diversity=false&query=$w.pos="verb"%20;%20$w';
//var q = 'HBCTPWeb/';
//var q = 'HBCTPWeb/search?db=test&from=1&to=2&diversity=false?query=$w.pos="noun"%20;%20$w'
//console.log('q:',q);
//console.log('q:',encodeURI(q));
var qFull  ='/HBCTPWeb/search?db=test2&from=1&to=30&diversity=true&query=$w.word="ילד" ; $w';
var qBase  ={
        base:'/HBCTPWeb/search?',
        db : 'test2',
        from: '1',
        to: '30',
        diversity:'true',
        query : '$w.word="ילד"',
        queryEnd  :' ; $w'
};


/**
 * if resTxt is valid conll31Json format - this method will parse it and will return an array of the sentences' results - omitting the search metaData
 * else -returns false
 * @param resTxt
 * @returns {*}
 */
function parseConll31Json(resTxt){
    if (resTxt.indexOf("No Results!") >=0){
        console.log('no results!!');
        return false;
    }else if (resTxt.indexOf("Invalid query") >=0){
            console.log('Invalid query  !!');
            return false;
    }else{
        var results = [];
        //console.log("debug html: ",resTxt.substring(resTxt.indexOf('***JSON_START***')+16, resTxt.indexOf('***JSON_END***')));
        var resJson = JSON.parse(resTxt.substring(resTxt.indexOf('***JSON_START***')+16, resTxt.indexOf('***JSON_END***')));
        //console.log("DEBUG: sentence meta-data: ", resJson["hitCount"], resJson["from"],resJson["to"] );
        //console.log(JSON.stringify(resJson['results']))
        for (sent in resJson['results']){
            //console.log(JSON.stringify(resJson['results'][sent]));
            results.push(resJson['results'][sent]);
            //results.push('<br>**********************************<br>');
        }
        return (results);
        //console.log(resJson);
    }


}


var dbs = ['haaretz','medical','tapuz','themarker','literary','knesset']



function searchSentencesCorpus(query, cb) {
    console.log("DEBUG: searchSentencesCorpus");
    var q =JSON.parse(JSON.stringify(qBase)); //clone the qBase object
    if (query['db']) q['db'] = query['db'];
    if (query['from']) q['from'] = query['from'];
    if (query['to']) q['to'] = query['to'];
    if (query['diversity']) q['diversity'] = query['diversity'];
    if (query['query']) q['query'] = query['query'];
    if (query['queryEnd']) q['queryEnd'] = query['queryEnd'];
    q = q['base'] + '&db=' + q['db'] + '&from='  + q['from'] + '&to='  + q['to'] +'&diversity='  + q['diversity'] + '&query=' + q['query']+q['queryEnd'];
    var tmp ="";
    //console.log("DEBUG: search engine --> the query is:<br>", q);
    http.get({ port: 35005, host: searchEngineServer, path: encodeURI(q)}, function(response) {

        //console.log('response:', response);
        //console.log('parse of response:', typeof(response));
        response.setEncoding('utf8');
        //res.charset = 'utf-8';
        //res.type('html');
        response.on('data', function(chunk) {
            //console.log('BODY-->'+chunk.toString());
            //res.charset = 'utf-8';
            //res.write(chunk.replace(/&quot;/g, "\"")); //TODO: this in order to make the hebrew correct
            tmp = tmp + chunk;

        });
        return response.on('end',
            function(){
                //res.end(); //when no modre data chunks availble - send 'end' signal to 'res'
                //res.send(tmp);
                //console.log((tmp.replace(/&quot;/g, "\"")));
                //console.log('DEBUG: getSE- all chunks and "END" sig were sent');
                var resJson = parseConll31Json(tmp.replace(/&quot;/g, "\""));
               // console.log("resJson is:",resJson);
                if (true) {
                    //console.log("DEBUG: returning ajax",resJson);
                    //req['resJson'] = resJson;
                    cb(null,resJson || []);
                }
                else res.send(JSON.stringify(resJson));
            });

        //res.send(response);
    }).on('error',
        function(err) {
            console.log('Error %s', err.message);}
    )};



exports.getSE = function getSE(req,res) {
    searchSentencesCorpus(req.query, handleHttpResults(req,res));
}


function exampleSentences(q,cb){
    //TODO: see https://github.com/substack/node-ent
    console.log("DEBGU: exampleSentences")
    if (!q.luname || !q.lupos) return cb(new Error("you must supply luname and lupos"));
    if (!util.posFormat(q['lupos'])) return cb(new Error("the POS specified is not acceptable"));
    q['db'] = dbs[_.random(0, 4)]
    q['from'] = 1
    q['to'] = 10
    q['diversity'] =true;
    q['query'] ="$w.lemma=\""+ q['luname']+"\" " +"$w.pos=\""+ util.posFormat(q['lupos'])+"\"";
    //q['queryEnd'] = query['queryEnd'];
    //console.log("exampleSentences --> query BEFORE SEND:",q);
    searchSentencesCorpus(q,function(err,results){
        if (err) return cb(err,results);
        //if (results.indexOf('No Results')!=-1 || results.indexOf('Invalid query')!=-1) cb(err, "no results or invalid query");
        var newRes = _.isArray(results) ? _.map(results,function(obj){ return util.linearizeConllSentence(obj['words'])/*.replace(/&#039;/g, "'")*/}) : results;
        //var newRes = _.isArray(results) ? _.map(results,function(obj){ return (util.linearizeConllSentence(obj['words'])).replace(/###NUMBER###/g, _.random(1,100))}) : results;

        //console.log(newRes.length,newRes)
        //console.log(util.linearizeConllSentence(results))

        cb(null, newRes)




    });

}
//TODO - breidge, move to routes
exports.getExampleSentences = function(req,res){ exampleSentences(req.query, handleHttpResults(req,res))};

