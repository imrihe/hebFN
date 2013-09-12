/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 9/1/13
 * Time: 6:39 PM
 * To change this template use File | Settings | File Templates.
 */

printModule("controllers/externalTools");

var morphServer = 'http://www.cs.bgu.ac.il/~nlpproj/demo/tag.php';
var dependencyParserServer = 'http://www.cs.bgu.ac.il/~yoavg/depparse/parse';
var searchEngineServer = 'http://localhost:5005/';
var searchEngineServer2 = 'http://localhost';


var request = require('request');
exports.getMorph = function(req,res) {
    console.log("DEBUG: handling get-morph post request");
    console.log("the request body is:", req.body);
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



exports.getDepParse = function(req,res) {
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
        //console.log("debug: ",resTxt);
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






exports.getSE = function getSE(req,res, cb) {
    console.log("DEBUG: getSE-->", req['query']);
    var q =JSON.parse(JSON.stringify(qBase)); //clone the qBase object
    var query = req['query'];
    if (query['db']) q['db'] = query['db'];
    if (query['from']) q['from'] = query['from'];
    if (query['to']) q['to'] = query['to'];
    if (query['diversity']) q['diversity'] = query['diversity'];
    if (query['query']) q['query'] = query['query'];
    if (query['queryEnd']) q['queryEnd'] = query['queryEnd'];
    q = q['base'] + '&db=' + q['db'] + '&from='  + q['from'] + '&to='  + q['to'] +'&diversity='  + q['diversity'] + '&query=' + q['query']+q['queryEnd'];
    var tmp ="";
    console.log("DEBUG: search engine --> the query is:<br>", q);
    http.get({ port: 5005, host: searchEngineServer, path: encodeURI(q)}, function(response) {

        //console.log('response:', response);
        //console.log('parse of response:', typeof(response));
        response.setEncoding('utf8');
        res.charset = 'utf-8';
        //res.type('html');
        response.on('data', function(chunk) {
            //console.log('BODY-->'+chunk.toString());
            res.charset = 'utf-8';
            //res.write(chunk.replace(/&quot;/g, "\"")); //TODO: this in order to make the hebrew correct
            tmp = tmp + chunk;

        });
        return response.on('end',
            function(){
                //res.end(); //when no modre data chunks availble - send 'end' signal to 'res'
                //res.send(tmp);
                //console.log((tmp.replace(/&quot;/g, "\"")));
                console.log('DEBUG: getSE- all chunks and "END" sig were sent');
                var resJson = parseConll31Json(tmp.replace(/&quot;/g, "\""));
               // console.log("resJson is:",resJson);
                if (req.isAjax) {
                    console.log("DEBUG: returning ajax");
                    req['resJson'] = resJson;
                    cb(req,res);
                }
                else res.send(JSON.stringify(resJson));
            });

        //res.send(response);
    }).on('error',
        function(err) {
            console.log('Error %s', err.message);}
    )};