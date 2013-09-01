/**           a
 * New node file
 */

printModule('controllers/english');
var Models = require("../models/schemes/hebrew.js");

var mongoose = require('mongoose');



/**
 *
 * @param req can contaion id or name or q when id is number, name is string starting with capital letter, and q is json query  - using double quetes for internal strings
 * @param res
 */
exports.loadFrame = function loadFrame (req, res) {
    console.log("DEBUG: handling load-hebrew-frame request");
    var  frameModel =Models.hebFrameModel,// mongoose.model(framesCollectionName, frame, framesCollectionName),
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
    console.log("DEBUG: handling load-hebrew-lu request");
    var  frameModel =Models.hebFrameModel,// mongoose.model(framesCollectionName, frame, framesCollectionName),
        query = {},
        queryProj = {"@ID":1, "@name":1, "lexUnit":1},
        limit = {'limit' : 50};
    //var usersRec = new userModel();

    //if (req.query.frameid) query[ '@ID']= req.query.frameid;
    if (req.query.luid) query[ 'lexUnit.@ID']= parseInt(req.query.luid);
    else if (req.query.frameid) query[ '@ID']= req.query.frameid;
    else if (req.query.luname) query['lexUnit.@name'] = {$regex : ".*"+req.query.luname+".*"};

    frameModel.find(query,queryProj, limit, function(err,response){
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
    console.log("DEBUG: handling load hebrew lexical units names request");
    var  frameModel = Models.hebFrameModel; //mongoose.model(framesCollectionName, frame,framesCollectionName );
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
    console.log("DEBUG: handling load hebrew frame-names request with req.query.params=", req.query);
    var  frameModel = Models.hebFrameModel;  // mongoose.model('Frame', frame, 'frame');
    var queryProj= {};
    var query = {};
    var limit = {};
    if  (req.query.all && req.query.all==0 )   {
        queryProj ={};
        limit = {'limit':10};
    }
    //check if list of lus of the frame is needed
    else if (req.query.lus && req.query.lus == 1) queryProj = {"@ID":1, "@name":1, "lexUnit.@name":1 ,"lexUnit.@ID":1, "_id":0};
    else queryProj =  {'@ID':1,'@name':1,'_id':0};
    frameModel.find(query , queryProj,limit, function(err,response){
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
 *the function recieves object and removes all the empty fields or <''>[empty string] fields
 * @param obj  - to delete the fields from
 * @returns the same object without the empty fields
 */
function omitEmpties(obj){
    var objKeys = utils.keys(obj);
    var proj = {};
    for (i in objKeys){
        if (!obj[objKeys[i]] || obj[objKeys[i]] == '') {
            //obj[objKeys[i]] = undefined;
            delete(obj[objKeys[i]]) ;
        }
    }
    return obj;
};


var utils = require('../tools/utils.js')
var luExm = require('../tools/population.js').hebLUexample;    //TODO
exports.addLUToFrame = function addLUToFrame (req, res) {
    console.log("DEBUG: handling lu to frame POST request")

    var resBody = req.body;
    var frameId = resBody['frameid'];
    if (!frameId) res.send("please try again - you must specify frame id to add a lexical-unit");
    else {
        var  frameModel =Models.hebFrameModel;  //mongoose.model(framesCollectionName, frame, framesCollectionName);
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



var pop = require('../tools/population.js')
var utils = require('../tools/utils.js');
exports.saveLUToFrame = function (req,res){
    console.log("DEBUG: add lu to frame request - loading form")
    var collectionNames = require('../controllers/general.js').collectionNames;
    var fieldNames =utils.keys(Models.hebFrameLUType.tree);// ['@ID', "@name"]
    var types = utils.values(Models.hebFrameLUType.tree);//["text", "text"]
    var fields = []
    for (var i =0 ; i<fieldNames.length; i++){
        fields.push({'name': fieldNames[i], 'type':types[i] });
    }
    //console.log("fields\n",fields );
    res.render('addLUToFrame.jade', {"collections": collectionNames, "fields": fields, 'exm':pop.hebLUexample });
}



