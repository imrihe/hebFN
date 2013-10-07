/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/27/13
 * Time: 3:29 PM
 * To change this template use File | Settings | File Templates.
 */

/*exports.keys = function keys (obj)
{
    var keys = [];
    for(var i in obj) if (obj.hasOwnProperty(i))
    {
        keys.push(i);
    }
    return keys;
};

exports.values = function values (obj){
    objkeys = this.keys(obj);
    //console.log("hh",objkeys);
    var vals =[];
    for(var i in objkeys)
    {
        //console.log(i);
        vals.push(obj[objkeys[i]]);
    }
    return vals;
} */

var spawn = require('child_process').spawn;
exports.linearizePython = function linearizePython(sentJson){
    console.log("DEBUG: linearizePython");
    var wordList = [];
    for (word in sentJson){
        wordList.push([sentJson[word]['word'], sentJson[word]['pos']])
    }
};

exports.validID = function validID(id) {
    if (id.match(/^[0-9a-fA-F]{24}$/)) return true;
    else return true;
};


//takes the luname, luid, framename, frameid paramteres from the query (for each one that exists) and takes the
exports.queryToCollectionQ= function queryToCollectionQ(query, names){

    var resQuery = {};
    names = names.split(' ');
    if (query.frameid && names[0]!='-') resQuery[names[0]] = Number(query['frameid']);
    if (query.framename && names[1]!='-') resQuery[names[1]] = query['strict'] ? query['framename'] : {$regex : ".*"+query['framename']+".*", $options: 'i'};
    if (query.luid && names[2]!='-') resQuery[names[2]]  =  query['luid'];
    if (query.luname &&names[3]!='-') resQuery[names[3]] =  query['strict'] ? query['luname'] : {$regex : ".*"+query['luname']+".*", $options: 'i'};
    if (query.sentenceid && names[4] && names[4]!='-') resQuery[names[4]]  =  query['sentenceid'];
    if (query.priority && names[5] && names[5]!='-') resQuery[names[5]]  =  {$lt : 998};
    //console.log("RESQUERY:",resQuery);
    return resQuery;
};


exports.handleHttpResults = function handleHttpResults(req,res){
    //res.charset='utf-8'
    //console.log("handleHttpResults", cb)
    console.log("DEUBUG: handleHttpResults: ",req.path)
    return function (err,result){
        console.log("DEBUG: handleResultsFunc: ", req.path)
        //throw new Error("handleResults: error retrieving results: "+err);

        if (err) {
            console.error("ERROR: handling error", err, err.stack);
            res.charset='utf-8'
            res.render('error.jade', {err:err, req: req})//(("handleResults: error retrieving results: "+err)) //TODO - problem with error handling
            //next()
        }//
        else if (!result ||result.length==0 ) res.send(206, "data not found");
        else {
            //console.log("DEBUG: sending", JSON.stringify(result))
            res.charset='utf-8';
            res.send(result);
        }
        //console.log(err, result);
    }
}


/**recieves a senence in Json format - the format must contatin array of words
 *
 * @param sentenceJson
 * @returns {string}
 */
function linearizeSentence(sentenceJson) {
    console.log("DEBUG: linearize sentence: recieved object! ");
    var sent ="";
    if (!Array.isArray(sentenceJson)) throw new error("the sentence is not valid");
    for (word in sentenceJson){
        sent = sent + sentenceJson[word]+ " ";
    }
    console.log("DEBUG: linearize sentence: returning result: ", sent);
    return sent;
}

/**
 *
 * @param sentenceJson - list of object -each object conatains a word
 * @returns {string}
 */
function linearizeConllSentence1(sentenceJson) {
    //require('../tools/utils.js').linearizePython(sentenceJson);
    console.log("DEBUG: linearizeConllSentence: recieved object1 ");
    var sent ="";
    //if (!Array.isArray(sentenceJson)) throw new Error("the sentence is not valid");
    console.log("DEBUG: the type of the recieved sentence in linearizeConllSentence is:", typeof(sentenceJson));
    for (word in sentenceJson){
        //sent = sent + sentenceJson[word]['word']+ " ";
        sent = sent + sentenceJson[word]['word']+ " ";
    }
    console.log("DEBUG: linearize sentence: returning result: ", sent);
    return sent;
}

exports.linearizeConllSentence  =function linearizeConllSentence(sentenceJson){
    if (! _.isArray(sentenceJson)) throw "the sentence is not valid for linearization"
    return _.reduce(sentenceJson, function(memo, sent){return memo +" "+sent['word']}, "")
}



/**recieves a request and
 *
 * @param req
 * @returns {{lu: {}, frame: {}, other: {}}}
 */
function parseReqParams(req, mode){
    console.log('DEBUG: parseReqParams')
    var lu = {},
        frame = {},
        other = {};
    if (req.param('action')) other['action'] =  req.param('action');
    if (req.param('comment')) other['comment'] =  req.param('comment');
    if (req.param('luname')) lu['luname'] =  req.param('luname');
    if (req.param('luid')) lu['luid'] =  req.param('luid');
    if (req.param('lupos')) lu['lupos'] =  req.param('lupos').toUpperCase();
    if (req.param('trans')) lu['trans'] =  req.param('trans');
    if (req.param('frameid')) frame['frameid'] =  req.param('frameid');
    if (req.param('framename')) frame['framename'] =  req.param('framename');
    if (req.param('decisionid')) other['decisionid'] =  objID(req.param('decisionid'));
    if (req.user && req.user.username) other['username'] =  req.user.username; else other['username'] = 'undefined'//TODO - add ensrueAhuthenticated

    if (mode && mode =='editlu'){
        if (req.param('definition')) lu['definition'] =  req.param('definition');
        if (req.param('status')) lu['status'] =  req.param('status');
        if (req.param('lexeme')) lu['lexeme'] =  req.param('lexeme');
        if (req.param('semType')) lu['semType'] =  req.param('semType');
        //fields = {definition: lu.definition, status: lu.status,lexeme: lu.lexeme, semType: lu.semType,'@incorporatedFE' : lu.incoFe}
    }
    return {lu: lu, frame:frame, other:other};
}

exports.parseReqParams = parseReqParams;



/**
 *the function recieves object and removes all the empty fields or <''>[empty string] fields
 * @param obj  - to delete the fields from
 * @returns the same object without the empty fields
 */
function omitEmpties(obj){
    var objKeys = _.keys(obj);
    var proj = {};
    for (i in objKeys){
        if (!obj[objKeys[i]] || obj[objKeys[i]] == '') {
            //obj[objKeys[i]] = undefined;
            delete(obj[objKeys[i]]) ;
        }
    }
    return obj;
}
