/**           a
 * english controllers for framenet
 */
printModule('controllers/english');

var Models = require("../models/schemes/english.js");
var q2coll = require('../tools/utils.js').queryToCollectionQ,
    handleHttpResults = require('../tools/utils.js').handleHttpResults;


/**
 *
 * @param req can contaion id or name or q when id is number, name is string starting with capital letter, and q is json query  - using double quetes for internal strings
 * @param res
 */
var loadFrame =exports.loadFrame = function loadFrame (query,proj,options,cb) {
    console.log("DEBUG: handling load-english-frame request");
    var  engframeModel = Models.frameModel,
        q = q2coll(query, '- frame.@name frame.lexUnit.@ID frame.lexUnit.@name'),
        qOptions = options ? options : {limit: 50, sort: {'frame.@name' :1}};
    //if (query.frameid) q["frame.@ID"] = query.frameid;
    if  (q["frame.@name"]) q["frame.@name"]=  {$regex : ".*"+query.framename+".*", $options: 'i'}; //runover the default -strict frame name check
    //console.log("find query:",typeof(query),  query);
    //console.log("QUERY:",q)
    engframeModel.find(q,proj,qOptions,cb);
};

exports.getFrame = function getFrame(req, res,cb){
    console.log("DEBUG: handling get-english-frame request");
    loadFrame(req.query,{},null,handleHttpResults(req,res))

}

exports.getFrameNames = function getFrameNames(req, res){
    console.log("DEBUG: handling get-frame-names request");
    var queryProj = {"_id": 0,"frame.@ID":1, "frame.@name":1},
        options = {sort: {'frame.@name': 1}};
    //console.log('QUERY:',query)
    loadFrame(req.query,queryProj,options,handleHttpResults(req,res))

};





/**this method returns single LU or collection of LUs according to the requested query:
 * if id is given  -the lu with the id will be returned
 * if name was given - a list of lus which thier name contains the give name will be returned.
 * if q was supplied - the result will be collection.find(JSON.parse(q))   (q implies query)
 *
 * if porjection (proj) was supllied -the query will return fields by this projection - otherwise all fields will be returned
 *
 * @param req {express.request}
 * @param res {express.response}
 */
var loadLuEng = exports.loadLuEng = function loadLuEng (query, proj, options, cb) {
    console.log("DEBUG: handling load english lu request");
    var  engluModel = Models.luModel,
        q = q2coll(query,  'lexUnit.@frameID lexUnit.@frame lexUnit.@ID lexUnit.@name'),
        qOptions = options ? options : {'limit' : 50, sort: {'lexUnit.@name': 1}};
    if (!query.luid && !((query.framename || query.frameid) && (query.luname || query.luid))) cb(new Error('some parameters are missing'))
    //var usersRec = new userModel();
    //if (query.luid) q[ 'lexUnit.@ID']= query.luid;
    //if (query.luname) q['lexUnit.@name'] = {$regex : ".*"+query.luname+".*", $options: 'i'};   //search all lus which contains the given name, 'i'=case insensitive

    //projection check:
    engluModel.findOne(q,proj, qOptions, cb)
};


exports.getLu = function getLu(req, res,cb){
    console.log("DEBUG: handling get-lu-frame request");
    loadLuEng(req.query,{},null,handleHttpResults(req,res))
};


var searchFrames = exports.searchFrames = function  searchFrames(query,projection, options, cb){
    if (query.luid) query.luid = Number(query.luid)
    var q = q2coll(query, 'frame.@ID frame.@name frame.lexUnit.@ID frame.lexUnit.@name');
    var qProj ={"_id":0,'frame.@name': "$frame.@name", 'frame.@ID': '$frame.@ID'}
    /*if (query.lus=1) {//TODO: filter frames by LU doesn't show the lu?..
        qProj['frame.lexUnit.@name']=1
        qProj['frame.lexUnit.@ID']=1
    }*/
    Models.frameModel.aggregate(
        {$match: q},//{frameid: Number('281') }},
        {$project: qProj},
        {$sort: {"frame.@name": 1}},
        cb)
}

exports.getSearchFrames = function (req, res){
    searchFrames(req.query, {},{},handleHttpResults(req,res))
}



var searchLus = exports.searchLus = function  searchLus(query,projection, options, cb){
    if (query.luid) query.luid = Number(query.luid)
    //var q = q2coll(query, 'frameid framename luid luname');
    var q = q2coll(query, 'lexUnit.@frameID lexUnit.@frame lexUnit.@ID lexUnit.@name');
    Models.luModel.aggregate(
        //{$project: {"_id":0,framename: "$lexUnit.@frame", frameid: '$lexUnit.@frameID', luname: '$lexUnit.@name', luid: '$lexUnit.@ID'}},
        {$project: {"_id":0,'lexUnit.@frame': "$lexUnit.@frame", 'lexUnit.@frameID': '$lexUnit.@frameID', 'lexUnit.@name': '$lexUnit.@name', 'lexUnit.@ID': '$lexUnit.@ID'}},
        {$match: q},//{frameid: Number('281') }},
        {$sort: {"luname": 1}},
        cb)

}

exports.getSearchLus = function (req, res){
    searchLus(req.query, {},{},handleHttpResults(req,res))
}

exports.getLuNames = function getLuNames1(req, res){
    console.log("DEBUG: handling get-lu-names request");
    var queryProj = {'lexUnit.@ID':1,'lexUnit.@name':1, 'lexUnit.@frame':1, 'lexUnit.@frameID':1, '_id':0},
        options = {sort: {'lexUnit.@name': 1}};
    //console.log('QUERY:',query)
    loadLuEng(req.query,queryProj,options,handleHttpResults(req,res))

};

exports.getLuNames1 = function getLuNames(req, res){
    Models.luModel.aggregate( {$sort: {"lexUnit.@name": 1}},
                              {$project: {"_id":0,"@name":1, '@ID':1, 'lexUnit.@name':1, 'lexUnit.@ID':1, 'lexUnit.@frame':1, 'lexUnit.@frameID':1}},
        function(err,results){
            res.send(results);
        })
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
    var limit = {sort:
    {'frame.@name': 1}};
    if  (req.query.all && req.query.all==0 )   {
        queryProj ={};
        limit['limit'] =10;
    }
    //check if list of lus of the frame is needed
    else if (req.query.lus && req.query.lus == 1) queryProj = {"frame.@ID":1, "frame.@name":1, "frame.lexUnit.@ID":1, "_id":0};
    else queryProj =  {'frame.@ID':1,'frame.@name':1};
    engframeModel.find(query , queryProj,limit, function(err,response){
        if (err) res.send("error with request: "+err)
        else if(!response || response.length==0)
            res.send("couldn't find any frame names: "+ response );

        else{
            console.log("found frame-names");
            res.charset = 'utf-8';
            res.send(response);
            //res.jsonp(response);
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
var loadAnnotations = exports.loadAnnotations = function loadAnnotations (query, proj, options, cb) {
    console.log("DEBUG: handling load english annotations request, quert: ");
    var  luModel = Models.luModel; //mongoose.model(luCollectionName, lu, luCollectionName);
    var q= q2coll(query, "lexUnit.@frameID lexUnit.@frame lexUnit.@ID lexUnit.@name");
    var qProj =proj ? proj : {"lexUnit.@ID":1, "lexUnit.@name":1,"lexUnit.@frame":1, "_id":0, "lexUnit.subCorpus":1 };
    var qOptions =options? options : {"limit":1};
    //if (query.luid) q = {"lexUnit.@ID": query.luid};
    //if (query.luname) q = {"lexUnit.@name": query.luname};
    luModel.find(q , proj, options,cb);
};

exports.getAnnotations = function(req,res){
    console.log("DEBUG: handling eng-getAnnotations request");
    loadAnnotations(req.query, null, {limit: 10}, handleHttpResults(req,res));
}

/**
 * loads the translation for specific lexical unit, @see {'models/mongoDB/schemes.js'} for details of the response schema
 * @param req
 * @param res
 */
var loadTranslations = exports.loadTranslations= function loadTranslations (query, proj, options, cb) {
    console.log("DEBUG: handling load translations request");
    if (query.strict && query.strict ==0) delete query['strict'];
    else query.strict=1
    console.log(query.strict)
    var q= q2coll(query,'- frameName luID name')

    var qOptions= options ? options : {limit: 50};
    //console.log("QUERY:",query)
    //console.log("DEBUG: handling load translations request with req.query.params=", req.query);
    var  TranslationModel = Models.translationModel;  // mongoose.model(translationsCollectionName, translation, translationsCollectionName);
    TranslationModel.find(q , proj, qOptions,cb)
};


exports.getTranslations = function(req,res) {
    console.log("DEBUG: handling get-translations request");
    var proj = {};//{"lexUnit.@ID":1, "lexUnit.@name":1,"lexUnit.@frame":1, "_id":0, "lexUnit.subCorpus":1 };
    var options ={"limit":100};
    loadTranslations(req.query,proj,options, handleHttpResults(req,res))
}