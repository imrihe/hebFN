/**
 * New node file a
 */
var mongoose = require('mongoose');

//var db = mongoose.connect('mongodb://elhadad2/HebFrameNetDB'),
var schema = mongoose.Schema;

	//scheme = require('../mongoDB/schemes');


var frame = require("./schemes.js").hebFrameType;
var lu = require("./schemes.js").hebFrameLUType;
//var translation = require("./schemes.js").translation;
var  framesCollectionName = 'hebFrames',
    sentencesCollectionName = 'sentences' ;



/**
 *
 * @param req can contaion id or name or q when id is number, name is string starting with capital letter, and q is json query  - using double quetes for internal strings
 * @param res
 */
exports.loadFrame = function loadFrame (req, res) {
    console.log("handling load-hebrew-frame request");
    var  frameModel = mongoose.model(framesCollectionName, frame, framesCollectionName),
        query = {},
        queryProj = {};
    //if (req.query.q) query =JSON.parse(req.query.q);

    if (req.query.id) query["@ID"] =  req.query.id;
    if (req.query.name) query["@name"] =  req.query.name;
    console.log("find query:",typeof(query),  query);
    frameModel.findOne(query,function(err,response){
        if (err || !response){
            console.log('err result', err);
            res.send("frame not found: "+ query );
        }
        else{
            //console.log('NO ERR result',frameRes);
            console.log("found frame: ", response['@ID'] );
            res.send(response);
        }
        //res.end();
    });

};


/**this method returns single LU or collection of LUs according to the requested query:
 * if luid is given  -the lu with the id will be returned
 * if framid is given  the lus of the frame will be returned
 * if name was given  - a list of frames and the relevant lus will be returned
 * if name was given - a list of lus which thier name contains the give name will be returned.
 *
 * if porjection (proj) was supllied -the query will return fields by this projection - otherwise all fields will be returned
 *
 * @param req
 * @param res
 */
//TODO: need to index the luID and the lu.@name
exports.loadLu = function loadLu (req, res) {
    console.log("handling load-hebrew-lu request");
    var  luModel = mongoose.model(framesCollectionName, frame, framesCollectionName),
        query = {},
        queryProj = {"@ID":1, "@name":1, "lexUnit":1},
        limit = {'limit' : 50};
    //var usersRec = new userModel();

    //if (req.query.frameid) query[ '@ID']= req.query.frameid;
    if (req.query.luid) query[ 'lexUnit.@ID']= parseInt(req.query.luid);
    else if (req.query.frameid) query[ '@ID']= req.query.frameid;
    else if (req.query.luname) query['lexUnit.@name'] = {$regex : ".*"+req.query.luname+".*"};

    luModel.find(query,queryProj, limit, function(err,response){
        if (err || !response){
            res.send("lu not found: "+ luID );
        }
        else{
            //console.log("found result:", query, '\n' ,response);
            res.charset = 'utf-8';
            res.send(response);
        }
    });

};


/** model method for luNames request
 *  TODO: build this
 * @param req
 * @param res
 */
exports.loadLuNames = function loadLuNames (req, res) {
    console.log("handling load hebrew lexical units names request");
    var  frameModel = mongoose.model(framesCollectionName, frame,framesCollectionName );
    var queryProj = {'@ID':1,'lexUnit.@name':1, 'lexUnit.@ID':1, '_id':0};
    var query = {"lexUnit.@name": {$exists: true}};
    var limit = {};
        //check
    frameModel.find(query , queryProj,limit, function(err,response){
        if (err || !response){
            res.send("error with request: "+ err || response );
        }
        else{
            console.log("found lu-names");
            res.charset = 'utf-8';
            res.send(response);
        }
    });
};

//TODO: sort the list before response
/**   returns names and ids of all frames, if lus=1 will return also list of related lus for each frame (under 'lexUnit=[]')
 *
 * @param req
 * @param res
 */
exports.loadFrameNames = function loadFrameNames (req, res) {
    console.log("handling load english frame-names request with req.query.params['lus']=", req.query.lus);
    var  engframeModel = mongoose.model('Frame', frame, 'frame');
    var queryProj= {};
    var query = {};
    var limit = {};
    if  (req.query.all && req.query.all==0 )   {
        queryProj ={};
        limit = {'limit':10};
    }
    //check if list of lus of the frame is needed
    else if (req.query.lus && req.query.lus == 1) queryProj = {"frame.@ID":1, "frame.@name":1, "frame.lexUnit.@ID":1, "_id":0};
    else queryProj =  {'frame.@ID':1,'frame.@name':1,'_id':0};
    engframeModel.find(query , queryProj,limit, function(err,response){
        if (err || !response){
            res.send("error with request: "+ response );
        }
        else{
            console.log("found frame-names");
            res.charset = 'utf-8';
            res.send(response);
        }
    });
};
//conn = mongoose.createConnection('elhadad2', 'HebFrameNetDB'),


exports.loadFrameData = function loadFrameData (req, res) {
    console.log("handling load english frame-names request with req.query.params['lus']=", req.query.lus);
    var  engframeModel = mongoose.model('Frame', frame, 'frame');
    var query= {};


    if (req.query.lus == 1) {
        query = {"frame.@ID":1, "frame.@name":1, "frame.lexUnit.@ID":1, "_id":0};
    }
    else query =  {'frame.@ID':1,'frame.@name':1,'_id':0};
    engframeModel.find({} , query,function(err,response){
        if (err || !response){
            res.send("error with request: "+ response );
        }
        else{
            console.log("found frame-names");
            res.charset = 'utf-8';
            res.send(response);
        }
    });
};


/**
 *
 * @param req the request should contaion lu=xxxx  for lu id number.
 * @param res
 */
exports.loadAnnotations = function loadAnnotations (req, res) {
    console.log("handling load english annotations request with req.query.params=", req.query);
    var  luModel = mongoose.model('lu', lu, 'lu');
    var query= {};
    var proj = {"lexUnit.@ID":1, "lexUnit.@name":1,"lexUnit.@frame":1, "_id":0, "lexUnit.subCorpus":1 };
    var options ={"limit":1};


    if (req.query.lu) {
        query = {"lexUnit.@ID": req.query.lu};
    }
    else query =  {};
    luModel.find(query , proj, options,function(err,results){
        if (err || !results){
            res.send("error with request: "+ resluts );
        }
        else{
            console.log("found resluts");
            res.charset = 'utf-8';
            res.send(results);
        }
    });
};

/**
 * loads the translation for specific lexical unit, @see {'models/mongoDB/schemes.js'} for details of the response schema
 * @param req
 * @param res
 */
exports.loadTranslations = function loadAnnotations (req, res) {
    console.log("handling load translations request with req.query.params=", req.query);
    var  TranslationModel = mongoose.model('translationsV3', translation, 'translationsV3');
    var query= {};
    var proj = {};//{"lexUnit.@ID":1, "lexUnit.@name":1,"lexUnit.@frame":1, "_id":0, "lexUnit.subCorpus":1 };
    var options ={"limit":1};


    if (req.query.luid) {
        query = {"luID": req.query.luid};
    }
    else query =  {};
    TranslationModel.find(query , proj, options,function(err,results){
        if (err || !results){
            res.send("error with request: "+ results );
        }
        else{
            console.log("found results");
            console.log("found results:", results[0]['translation']);
            res.charset = 'utf-8'; //in chrom it doesn't work work without this
            //res.set({'content-type': 'application/json'});
            res.send(results);
        }
    });
};

var utils = require('../../tools/utils.js')
var luExm = require('../../tools/population.js').hebLUexample;    //TODO
function omitEmpties(obj){
    var objKeys = utils.keys(obj);
    var proj = {};
    for (i in objKeys){
        if (!obj[objKeys[i]] || obj[objKeys[i]] == '') {
            obj[objKeys[i]] = undefined;
            //delete(obj[objKeys[i]]) ;
        }
    }
    return obj;
}
exports.addLUToFrame = function addLUToFrame (req, res) {

    var resBody = req.body;
    var frameId = resBody['frameid'];
    if (!frameId) res.send("please try again - you must specify frame id to add a lexical-unit");
    else {
        var  frameModel = mongoose.model(framesCollectionName, frame, framesCollectionName);
        frameModel.count({'@ID': frameId}, function(err, returnedObj){
                console.log("calling function");
                if (err) {
                    console.log("err in data base connection");
                    return res.send("data base connection error");
                }
                else if (returnedObj ==0) {
                    //console.log("returnedObj \<\= 0", returnedObj);
                    res.send(404, "the wanted frame does not exist");
                }
                else {
                    console.log("good job", returnedObj);
                    res.charset = 'utf-8'; //in
                    var lu;
                    var luID = mongoose.Types.ObjectId();

                    if (resBody['fulllu'] == 'on'){
                        lu  = JSON.parse(resBody['lexUnit']);
                        console.log("using full lu:", lu);
                    }
                    else{
                        delete(resBody['frameid']);
                        delete(resBody['lexUnit']);

                        lu = omitEmpties(resBody); //TODO: remove from here to client side - remove empty fields
                        //lu = resBody;
                        lu['@ID'] = luID;

                        console.log("using parameters");

                    }

                    //set automatic fields:
                    lu['@cDate'] = new Date();
                    lu['@ID'] = luID;
                    if (req.user && req.user.username) lu['@cBy'] = req.user.username;
                    else lu['@cBy'] = 'unknown';
                    console.log("setting LU:", lu);
                    frameModel.findOneAndUpdate({"@ID": frameId}, {$push: {"lexUnit":lu}}, function(err, returnedObj) {
                        if (err) return res.send("contact addMsg error: " + err);
                        //console.log('the results object is: ', returnedObj['lexUnit']);
                        res.send("document was saved!");
                    });
                    //return res.send(lu);

                }//else
            }//function
        );

    }
};




//TODO  - sort all this shit
var mongoose =require('mongoose');
var Form    = require('mongoose-forms').Form;
var schemes = require('./schemes.js');
//var  Model = mongoose.model("hebFrames", fschem, "hebFrames");
//var form    = Form(Model);
//console.log(form);

var pop = require('../../tools/population.js')
var utils = require('../../tools/utils.js');
exports.saveLUToFrame = function (req,res){
    var fieldNames =utils.keys(schemes.hebFrameLUType.tree);// ['@ID', "@name"]
    var types = utils.values(schemes.hebFrameLUType.tree);//["text", "text"]
    var fields = []
    for (var i =0 ; i<fieldNames.length; i++){
        fields.push({'name': fieldNames[i], 'type':types[i] });
    }
    //console.log("fields\n",fields );
    res.render('addLUToFrame.jade', {"collections": general.collectionNames, "fields": fields, 'exm':pop.hebLUexample });
}