/**           a
 * english controllers for framenet
 */
printModule('controllers/english');

var Models = require("../models/schemes/english.js");



/**
 *
 * @param req can contaion id or name or q when id is number, name is string starting with capital letter, and q is json query  - using double quetes for internal strings
 * @param res
 */
exports.loadFrame = function loadFrame (req, res) {
    console.log("DEBUG: handling load-english-frame request");
    var  engframeModel = Models.frameModel;
    //var  engframeModel = mongoose.model(frameCollectionName, frame, frameCollectionName),
        query = {},
        queryProj = {};
    //if (req.query.q) query =JSON.parse(req.query.q);

    if (req.query.frameid) query["frame.@ID"] =  req.query.frameid;
    if (req.query.name) query["frame.@name"] =  req.query.name;
    //console.log("find query:",typeof(query),  query);
    engframeModel.findOne(query,function(err,frameRes){
        if (err || !frameRes){
            //console.log('err result', err);
            res.send("frame not found: "+ query );
        }
        else{
            //console.log('NO ERR result',frameRes);
//            /console.log("found frame: ", frameRes['frame']['@ID'] );
            res.send(frameRes);
        }
        //res.end();
    });

};



/**this method returns single LU or collection of LUs according to the requested query:
 * if id is given  -the lu with the id will be returned
 * if name was given - a list of lus which thier name contains the give name will be returned.
 * if q was supplied - the result will be collection.find(JSON.parse(q))   (q implies query)
 *
 * if porjection (proj) was supllied -the query will return fields by this projection - otherwise all fields will be returned
 *
 * @param req
 * @param res
 */
exports.loadLuEng = function loadLuEng (req, res) {
    console.log("DEBUG: handling load english lu request");
    var  engluModel = Models.luModel;
    //var  engluModel = mongoose.model(luCollectionName, lu, luCollectionName),
        query = {},
        queryProj = {},
        limit = {'limit' : 50};
    //var usersRec = new userModel();
    if (req.query.q) {
        try {query = JSON.parse(req.query.q);}
        catch(err) {console.log("query parsing exception "+ err)};
    }
    else if (req.query.luid) query[ 'lexUnit.@ID']= req.query.luid;
    else if (req.query.luname) query['lexUnit.@name'] = {$regex : ".*"+req.query.luname+".*"};   //search all lus which contains the given name

    //projection check:
    if (req.query.proj) try{ queryProj = JSON.parse(req.query.proj);}
    catch(err) {console.log("query parsing exception" + err)};
    engluModel.find(query,queryProj, limit, function(err,response){
        if (err || !response){
            res.send("lu not found: "+ luid );
        }
        else{
            res.send(response);
        }
    });

};




/** model method for luNames request
 *  TODO: sort the list before response
 * @param req
 * @param res
 */
exports.loadLuNames = function loadLuNames (req, res) {
    console.log("DEBUG: handling load english lexical units names request");
    var  engluModel = Models.luModel;
    //var  engluModel = mongoose.model(luCollectionName, lu, luCollectionName);
    var queryProj = {};
    var query = {};
    var limit = {};
    //check
    if  (req.query.all)   {
        queryProj ={};
        limit= {'limit': 100};
    }
    else queryProj = {'lexUnit.@ID':1,'lexUnit.@name':1, 'lexUnit.@frame':1, 'lexUnit.@frameID':1, '_id':0};

    engluModel.find(query , queryProj,limit, function(err,response){
        //engluModel.find({} , {'lexUnit.@ID':1,'lexUnit.@name':1, 'lexUnit.@frame':1, 'lexUnit.@frameID':1, '_id':1}).sort({'lexUnit.@name': -1}).exec(function(err,response){
        if (err || !response){
            res.send("error with request: "+ err || response );
        }
        else{
            console.log("found lu-names");
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
    console.log("DEBUG: handling load english frame-names request with req.query.params['lus']=", req.query.lus);
    var  engframeModel = Models.frameModel;
    //var  engframeModel = mongoose.model(frameCollectionName, frame, frameCollectionName);
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
            res.send(response);
        }
    });
};




//TODO: check where i am using this one if i am
/*exports.loadFrameData = function loadFrameData (req, res) {
    console.log("handling load english frame-names request with req.query.params['lus']=", req.query.lus);
    var  engframeModel = mongoose.model(frameCollectionName, frame, frameCollectionName);
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
            res.send(response);
        }
    });
};*/




/**
 *
 * @param req the request should contaion luid=xxxx  for lu id number.
 * @param res
 */
exports.loadAnnotations = function loadAnnotations (req, res) {
    console.log("DEBUG: handling load english annotations request with req.query.params=", req.query);
    var  luModel = Models.luModel; //mongoose.model(luCollectionName, lu, luCollectionName);
    var query= {};
    var proj = {"lexUnit.@ID":1, "lexUnit.@name":1,"lexUnit.@frame":1, "_id":0, "lexUnit.subCorpus":1 };
    var options ={"limit":1};
    if (req.query.luid) {
        query = {"lexUnit.@ID": req.query.luid};
    }
    else query =  {};
    luModel.find(query , proj, options,function(err,results){
        if (err || !results){
            res.send("error with request: "+ resluts );
        }
        else{
            console.log("found resluts");
            res.send(results);
        }
    });
};





/**
 * loads the translation for specific lexical unit, @see {'models/mongoDB/schemes.js'} for details of the response schema
 * @param req
 * @param res
 */
exports.loadTranslations= function loadTranslations (req, res) {
    console.log("DEBUG: handling load translations request with req.query.params=", req.query);
    var  TranslationModel = Models.translationModel;// mongoose.model(translationsCollectionName, translation, translationsCollectionName);
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
            console.log("found results:", results);
            res.charset = 'utf-8'; //in chrom it doesn't work work without this
            //res.set({'content-type': 'application/json'});
            res.send(results);
        }
    });
};

