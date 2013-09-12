/**
 * hebrew contorlller:
 * this page contains all the server and DB logic related to hebrew FN data.
 * the methods defined in this page are being used by the routes module and are depended on the models/schemes
 *
 */

printModule('controllers/hebrew');

var Models = require("../models/schemes/hebrew.js");

var objID = require('mongoose').Types.ObjectId;


/**
 *
 * @param req can contaion id or name or q when id is number, name is string starting with capital letter, and q is json query  - using double quetes for internal strings
 * @param res
 */
exports.loadFrame = function loadFrame (req, res) {
    console.log(req['url'], req.query);
    console.log("DEBUG: handling load-hebrew-frame request");
    var  frameModel =Models.hebFrameModel,// mongoose.model(framesCollectionName, frame, framesCollectionName),
        query = {},
        queryProj = {};
    //if (req.query.q) query =JSON.parse(req.query.q);

    if (req.query.frameid) query["@ID"] =  req.query.frameid;
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

            //res.send("<html> <body><h2>"+response+"</h2></body></html>");
            //res.write(response);
            //res.end();
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

    //build the query by the parameters (non is obligatory)
    if (req.query.luid) query[ 'lexUnit.@ID']= parseInt(req.query.luid);
    if (req.query.frameid) query[ '@ID']= req.query.frameid;
    if (req.query.luname) query['lexUnit.@name'] = {$regex : ".*"+req.query.luname+".*"};

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
    var query = {"lexUnit.@ID": {$exists: true}};
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



var utils = require('../tools/utils.js')

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
}

/**
 *
 * @param req
 * @param res
 */
exports.addLUToFrame = function addLUToFrame (req, res) {
    console.log("DEBUG: handling lu to frame POST request");

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
                    var luID = objID();

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



/** step 2 in the process - from generation
 * generates a form to add a new lexical unit to a frame
 * @param req
 * @param res
 */
exports.saveLUToFrame = function (req,res){
    var pop = require('../tools/population.js');
    console.log("DEBUG: add lu to frame GET request - loading form");
    //var collectionNames = require('../controllers/general.js').collectionNames;
//    /console.log("tree",Models.hebFrameLUSchema);
    var fieldNames =utils.keys(Models.hebFrameLUSchema.tree);// ['@ID', "@name"]
    var types = utils.values(Models.hebFrameLUSchema.tree);//["text", "text"]
    var fields = [];
    for (var i =0 ; i<fieldNames.length; i++){
        fields.push({'name': fieldNames[i], 'type':types[i] });
    }
    res.render('addLUToFrame.jade', {"fields": fields, 'exm':pop.hebLUexample }); //exm - will be inserted as exampe for input data
};


/**step 2 in the process - form generation
 * the req body contains the sentence details:
    * target frame ID
    * target LU ID
    * sentence JSON! after yoav and meni!
    * target word token ID
 *
 * @param req
 * @param res
 */
exports.addSentenceToLUForm = function (req,res, obj){
    console.log("DEBUG: add sentence to lu GET request - loading form");
    var obj;
    //if (req.isAjax) return = externalTools.getSE(req, res, hebControl.addSentenceToLUForm);
    //var collectionNames = require('../controllers/general.js').collectionNames;
    //console.log("tree",Models.hebFrameLUSchema);
    var sentId = req['query']['sentenceid'];
    var sentence = req['query']['sentence'];

    var fieldNames =utils.keys(Models.hebFrameLUSchema.tree);// ['@ID', "@name"]
    var types = utils.values(Models.hebFrameLUSchema.tree);//["text", "text"]
    var fields = [];
    for (var i =0 ; i<fieldNames.length; i++){
        fields.push({'name': fieldNames[i], 'type':types[i] });
    }
    //console.log("fields\n",fields );
    console.log('sentence id: ', sentId);
    //console.log("the ajax is:",req['resJson']);
    res.render('addSentenceToLU.jade', {'sentJson': req['resJson'],'sentence' : sentence, 'sentenceid': sentId});
    console.log("the ajax is:",req['resJson']);
};



function valid31Format(candidate){return true;} //TODO!!! - complete this function or put as pre-save
function linearizeSentence(sentenceJson) {
    console.log("DEBUG: linearize sentence: recieved object! ");
    var sent ="";
    if (!Array.isArray(sentenceJson)) throw new error("the sentence is not valid");
    for (word in sentenceJson){
        //sent = sent + sentenceJson[word]['word']+ " ";
        sent = sent + sentenceJson[word]+ " ";
    }
    console.log("DEBUG: linearize sentence: returning result: ", sent);
    return sent;
}

function linearizeConllSentence(sentenceJson) {
    require('../tools/utils.js').linearizePython(sentenceJson);
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

var addLUToSentence = exports.addLUToSentence = function addLUToSentence (req,res, cb){
    console.log("DEBUG: adding the LU to the Sentence");
    var lu = req.body.luid;
    if (!lu) res.send ("please specify luid in order to add LU to the sentence")
    else{
        var sentModel = Models.hebSentenceModel;
        //sentModel.findOneAndUpdate({},);
        console.log('DEBUG: ', 'request is: ', req.body, req['sentenceid']);
        sentModel.findOneAndUpdate({"ID": req['body']['sentenceid']}, {$addToSet: {"lus":lu}}, function(err, returnedObj) {
            if (err || !returnedObj){
                console.log('DEBUG: problem adding lu to sentence', err, returnedObj);
                if (!returnedObj) res.send("there was an error adding the lus to the sentence = object wasn't found");
                else res.send("there was an error adding the lus to the sentence");
            }else{
                res.charset= 'utf-8';
                console.log('DEBUG: the lu ', lu, 'was added to the sentence', req['body']['sentenceid'], '\n', returnedObj);
                cb(req, res,function(){res.send({'msg': 'good! the \' add sentence to LU\' process was finished','obj': (returnedObj)})});  //here cb is 'addsentencetolu
            }
        });
    }

};


/**
 * add sentence to lexical Unit - needed frameID and LUid and sentenceID -this will be added to the luSentence collection
 * this will be an 'save' by luid and frameid
 * the pairing will be added only if the sentence (by id) is not already associated with the luid + frameid
 * @type {Function}
 */
var addSentenceToLU = exports.addSentenceToLU = function addSentenceToLU(req,res, cb){
    var model = Models.luSentenceModel;
    var body = req.body;

    if (!body['luid'] || !body['frameid'] || !body['sentenceid']){
        console.log('DEBUG: not enough parameters for the request of  addSentenceToLU- ', req);
        res.send('error: not enough parameters -luid, frameid and sentenceid');
    }
    else{
        var content = {
            'luId' : body['luid'],
                //'luName': TODO
            'frameID': body['frameid'],
            'sentenceID': body['sentenceid']
        };
        //content['sentenceID'] = objID("5229b677b6b700bb4300002d");  -//TODO remove-  for DEBUGGING only
        var objToSave = new Models.luSentenceModel(content);
        //model.insert(content,function(err, result){res.send({'err':err, 'result':result})}) ;
        objToSave.save(function (err) {
            if (err) {
                console.log('DEBUG: error saving the sentence-lu association in the sentnecelu collection', err);
                res.send('error saving the snetnece lu association\n' + err);
            }
            else cb();
        })
    }
};



/*
 1	מה	_	QW	QW	_	2	SBJ	_	_
 2	נשמע	_	VB	VB	M|S|3|PAST|NIFAL	3	SBJ	_	_
 3	חבר	_	VB	VB	M|S|2|IMPERATIVE|PIEL	0	ROOT	_	_
 */


/* adding a sentence to a LU is built from few steps:
1. add the sentence to the sentence collection if not exists.
2. add the lu to the sentence lus list.
3. add the sentence to the lu's sentences list.

 */
/**step 2 in the process -
 *      part1 - add sentence to the sentences collection
 *      assuming that the sentence doesn't exist in the sentences collection
 *          the req body contains the sentence details:
 *          sentence JSON! after yoav and meni!
 * target word token ID
 *
 * @param req
 * @param res
 */
exports.addSentenceToDB = function addSentenceToDB(req,res){
    console.log("DEBUG: add sentence to lu - POST request");
    var resBody = req.body;
    var sentence = resBody['sentence'];
    console.log("DEBUG: add sentence to lu - the recieved sentence is:", sentence);

    var sentenceid = resBody['sentenceid'];
    /*if (!(frameId && luid && sentenceTxt && targetID)){
        console.log('DEBUG: not enough parameters for the request - one of the parameters is missing');
        res.send("one of the parameters is missing");
    } */
    if ((! sentence && !sentenceid) || (sentence && ! valid31Format(sentence))) res.send("the sentence is not vaild conll31 format");  //TODO: valid31Format
    else {

        if (sentence){
            var  sentenceModel =Models.hebSentenceModel;
            var sentJson = {
                "text":linearizeConllSentence(JSON.parse(sentence)['words']),//TODO
                "sentenceProperties" : sentence['sentenceProperties'],
                "content" : [{"words": JSON.parse(sentence)['words']}], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
                //"lus":[IDType],//save the related LU ids
                "ID":objID(),
                "source": 'manual'//{type: String, enum: ["corpus", "manual", "translation"]},//TODO
            };
            //sentJson['Content'] = [{a: "a"}];
            console.log('DEBUG: add sentencetoDB - the result JSON is:',JSON.stringify(sentJson));
            //res.send(sentJson);
            console.log('content:', typeof(sentJson['content'][0]));
            var sent = new sentenceModel(sentJson);
            console.log('DEBUG: the model is:',sent);
            sent.save(function(err){
                if (err){
                    console.log('DEBUG: problem saving sentence', err);
                    res.send("problem saving sentence - abort");
                }
                else {
                    console.log('sentence was saved!, id:',sentJson["ID"]);
                    req['body']['sentenceid'] = sentJson['ID'];
                    addLUToSentence(req, res, addSentenceToLU);
                }});//save
        }else{ //case: no sentence, there is a sentence id
            console.log('DEBUG: skipping <save sentence> adding lu to sentence')
            addLUToSentence(req, res, addSentenceToLU);

        }

    }//else
};//method export


/**
 * returns a list of all the sentences in the 'sentences' collection (including which lus are related to them)
 * @param req
 * @param res
 */
exports.listAllSentences = function listAllSentences(req,res){
    console.log("DEBUG: handling listAllSentences method" );
    Models.hebSentenceModel.find({}, {'sentenceOrigin': 0},{'limit': 200}, function(err, resObj){
       res.charset = 'utf-8';
       if (err) {
           console.log("DEBUG:problem in list all sentences");
           res.send("error occurred while handling quert");
       }
       else if (!resObj){
           res.send("couldn't find any sentences");

       }else{
           //res.charset = 'utf-8';
           //res.send(JSON.parse(JSON.stringify(resObj)));
           res.render('sentencesList.jade', {'result':resObj});

       }

    });
};


/**
 * returns a list of all the lu-sentence relations (each sentence-lu is a record which contains list of annotations)
 * @param req
 * @param res
 */
exports.luSentence = function luSentence(req,res){
    console.log("DEBUG: handling luSentence method" );
    Models.luSentenceModel.find({}, {"__v": 0},{'limit': 200}, function(err, resObj){
        res.charset = 'utf-8';
        if (err) {
            console.log("DEBUG:problem in luSentence");
            res.send("error occurred while handling query");
        }
        else if (!resObj){
            res.send("couldn't find any records");

        }else{
            res.send(JSON.parse(JSON.stringify(resObj)));
            //res.render('sentencesList.jade', {'result':resObj});

        }

    });

};

/**TODO
 * check if the sentence is in the data base -search by the text linearization, return the id if in DB else return undefined
 *
 * @param sentence {indb: 'on', content:}
 * @returns {*}
 */
function isInDB(sentenceText,cb){               //TODO - this is just a stub now!!
    console.log("DEBUG: isInDB ");
    Models.hebSentenceModel.findOne({"text": sentenceText}, {"ID":1},function(err, resObj){
        if (!err){
            console.log("DEBUG-isInDB: text search result in sentences coll:", resObj);
            if (resObj) cb(resObj.ID, 'good');
            else Models.hebBadSentenceModel.findOne({"text": sentenceText}, {"ID":1},function(err, resObj2){
                if (!err){
                    console.log("DEBUG: text search result in badSentences coll", resObj2);
                    if (resObj2) cb(resObj2.ID, 'bad');
                    else cb(resObj2);
                }});
            }
        else throw new Error("connetion error with DB : isInDB");
        }
    );
}
    //if (sentence['indb']) return "523188378916588b7c000038" //todo
    //else return undefined;
    //cb(result);

/**recieves a sentenceString (including the sentence properties) and data object and sentId.
 * if the sentence id is not defined\false -creates a new id, extract from the data only the source of the sentence
 * @param sentString
 * @param data
 * @param sentId
 * @returns {{text: *, sentenceProperties: *, content: Array, ID: *, source: *}}
 */
function createSentenceJson(sentString, data){
    console.log("DEBUG: createSentenceJson", typeof(sentString),"   ",sentString );
    var sentObj = JSON.parse(sentString);
    return {
        "text":linearizeConllSentence(sentObj['words']),//TODO
        "sentenceProperties" : sentObj['sentenceProperties'],
        "content" : [{"words": sentObj['words']}], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
        //"lus":[IDType],//save the related LU ids
        //"ID": sentId ? objID(sentId) : objID(),
        "source": data ? data['source'] : 'manual'//{type: String, enum: ["corpus", "manual", "translation"]},//TODO
    };

}


/**process bad sentence:
 * add bad segmented sentence to the bad sentences collection in order to track the segementations in the future and to make sure that all the sentences are tracked
 * @param sentJson
 * @returns {*}
 */
function processBadSentence(sentJson, data, control, id){
    "add the sentence to the bad sentences collection"
    console.log("DEBUG: processing processBadSentence",id);
    var succ = ("the sentence was added to the bad sentences collection with id: " + id);
    //var sentObj = new badSentenceModel(sentJson);
    sentJson['ID'] = id ?id : objID();
    new Models.hebBadSentenceModel(sentJson).save(function(err){
        if (err) {
            console.log("error saving sentence", err);
            control.write("error saving sentence" + sentJson);
            control.dec();
        }
        console.log(succ);
        control.write("the bad-segmented-sentence was saved successfully -!" + sentJson['ID']);
        control.dec();
    });
}


/**add new sentence to the DB - will be called only for valid segmented sentences
 *
 * @param sentJson - valid sentence JSON, no ID
 * @returns {*}
 */
function addNewSentenceToLU(sentJson,data,control,id){
    console.log("DEBUG: processing addNewSentenceToLU");
    //1.add sentence to the sentences DB
    var id = objID();
    sentJson['ID'] = id;
    //2.add luid to the sentence 'lus' field
    var luid = objID(data['luid']);
    sentJson['lus'] =luid;
    new Models.hebSentenceModel(sentJson).save(function(err){
        if (err) {
            console.error("DEBUG-addNewSentenceToLU: error saving sentence to DB addNewSentenceToLU-phase-1");
            control.write("error saving sentence to DB addNewSentenceToLU-phase-1");
            control.dec();
        }
        else {
            console.log('"DEBUG-addNewSentenceToLU:: the sentence was saved to BD with Id', id);
            //3. add the sentenceid, frameid, luid to the sentence-lu collection
            var luSent  = {sentenceID: id, luId: luid, frameID: data['frameid']};
            new Models.luSentenceModel(luSent).save(function(err){
                if (err) {
                    control.write("error saving sentence-lu to DB addNewSentenceToLU-phase-2"+ err);
                    control.dec();
                    console.error("DEBUG-addNewSentenceToLU: error saving sentence-lu to DB addNewSentenceToLU-phase-2",err);
                }
                else {
                    control.write("the sentence-lu was saved"+ luSent.sentenceID + " " + luSent.luId);
                    control.dec();
                    console.log("DEBUG-addNewSentenceToLU: the sentence-lu was saved", JSON.stringify(luSent));
                }
            });
        }
    });
    return sentJson;
}

/** add the LU to the sentence - the sentence already exists in the DB - need to check the if it is already associated to the lu-frame
 *
 * @param sentJson
 * @param data
 * @returns {*}
 */
function addExistSentenceToLU(sentJson, data,control,id,coll){
    console.log("DEBUG: processing addExistSentenceToLU",id, data['luid']);
    //1. check if we have already sentence-lu association
    //1.1 if exists - return -"association exists"
    //1.2 else:
    //1.2.1 add the lu to the sentence['lus'] list
    //1.2.2 add triple - sent-lu-frame to luSentence collection
    //var id = sentJson['ID'];
    var luid = objID(data['luid']);
    console.log("DEBUG-addExistSentenceToLU:searching for id:", luid, "sentId:", id);
    //Models.hebSentenceModel.findOne({'ID':id,'lus': luid}, function(err, resObj){
    Models.hebSentenceModel.find({'ID':id, 'lus': luid}, function(err, resObj){
        var associated;
        if (err) {
            console.error("DEBUG-addExistSentenceToLU: error searching for lu in sentence");
            control.write("error searching for lu in sentence");
            control.dec();
        }
        else {
            if (resObj && resObj.length >0){
                console.log("DEBUG-addExistSentenceToLU: the sentence and lu are already associated");
                associated= true;
                control.write("the sentence and lu are already associated");
                control.dec();

            }else {
                associated=false
                //processUnAssociated(sentJson, data);
                //1.2.1 add the lu to the sentence['lus'] list
                Models.hebSentenceModel.findOneAndUpdate({'ID':id}, {$push: {"lus":luid}}, function(err, returnedObj) {
                    if (err) console.log("DEBUG-addExistSentenceToLU: error adding lu to sentence lus list");
                    else if (!returnedObj) {
                        console.log("DEBUG-addExistSentenceToLU: couldn't fint the sentence");
                        control.write("couldn't fint the sentence");
                        control.dec();
                    }
                    else {
                        console.log("DEBUG: success - the lu was added to the sentence", id);
                        var luSent  = {sentenceID: id, luId: luid, frameID: data['frameid']};
                        new Models.luSentenceModel(luSent).save(function(err){
                            if (err){
                                console.log(err);
                                throw new Error("addExistSentenceToLU: error saving sentence-lu to DB addNewSentenceToLU-phase-2"+err);
                            }
                            else {
                                console.log("DEBUG-addExistSentenceToLU: addExistSentenceToLU: the sentence-lu was saved", luSent);
                                control.write("addExistSentenceToLU: the sentence-lu was saved");
                                control.dec();
                            }
                        });
                    }
                })
            }

            //console.log("DEBUG-addExistSentenceToLU :proccessing associated: ", associated, resObj.length);
        }


    });
    /*return
    sentJson['lus'] =luid;
    new Models.hebSentenceModel(sentJson).save(function(err){
        if (err) throw new Error("error saving sentence to DB addNewSentenceToLU-phase-1");
        else {
            console.log('DEBUG: the sentence was saved to BD with Id', id);
            //3. add the sentenceid, frameid, luid to the sentence-lu collection
            var luSent  = {sentenceID: id, luId:luid, frameID: data['frameid']};
            new Models.luSentenceModel(luSent).save(function(err){
                if (err) throw new Error("error saving sentence-lu to DB addNewSentenceToLU-phase-2");
                else console.log("the sentence-lu was saved", JSON.parse(luSent));
            });
        }
    });
    return sentJson;*/
}
/**
 *
 * @param sent - string representing the sentence in the following format:
 *  {inddb=objID\true\ubdefined, content=string of 31-conll sentence format}
 * @param data
 * @returns {*}
 */
function processSentence(sent, data, control, sentenceNumber){
    var func;
    var action  = sent['action'];
    console.log('processing sentence number:', sentenceNumber, "action:", sent['action']);
    var sentJson  = createSentenceJson(sent['content'], data); //(sent['indb'] ? (sent['indb']) : undefined) ); //parse the sentence by schema
    var msg;
    function skipSentence (){
        console.log("no action was chosen for the sentence", msg);
        control.write("no action was chosen for the sentence " + msg);
        control.dec();
    }

    //
    isInDB(sentJson['text'], function(id, coll){
        console.log("DEBUG: processSentence CB function: recieved id:",id);
        switch (action) {
            case 'badseg':
                if (id && coll=='bad') {
                    msg = id +coll
                    func=skipSentence
                }
                else func=processBadSentence;
                break;
            case 'addtolu':
                if (id && coll=='good')  func=addExistSentenceToLU;
                else if (!id) func=addNewSentenceToLU;
                else {
                    msg = id +coll
                    func=skipSentence;
                }
                break;
            case 'nothing':
                msg =  'nothing';
                func=skipSentence;
                break;

        }
        if (func) return func(sentJson, data,  control,id, coll);
        else return "action: nothing";
    } );
}


/*if (action=='badseg') func=processBadSentence;
else if (action['addtolu']){
if (id)  func=addExistSentenceToLU;
else func=addNewSentenceToLU;
}
//func = function(s) {return s};

return func(sentJson, data,  inDB, control);

console.log("no action was chosen for the sentence");
control.write("no action was chosen for the sentence");
control.dec();
*/


/**
 *
 * @param req - req['method']==post, req['body']= {}
 * @param res
 */
exports.addSentencesToLu = function addSentencesToLu(req,res) {
    console.log("DEBUG: addSentencesToLu");//reqbody:", req.body);
    //res.send(req.body);
    //return
    var sentences= req.body.sentences;
    var data = req.body.data    ;
    //options: bad segmentation - add to 'badSentences', good- add to lu? check if already in DB and in LU? else - nothing
    res.charset='utf-8';
    console.log("DEBUG-addSentencesToLu: data->", data);
    var control = {results: [], counter : sentences.length,
        write : function(msg){this.results.push(msg);},
        end: function(){res.send(this.results)},
        dec:function(){
            this.counter= this.counter-1;
            if (this.counter==0) this.end();
        } };
    //console.log("control obj:", control);
    for (sentence in sentences){
        processSentence(sentences[sentence], data, control,sentence);
        /*if (sentences[sentence]['addtolu'] || sentences[sentence]['badseg'])
            resultsArr.push(processSentence(sentences[sentence], data, control, sentence));
        else {
            console.log("no action was chosen for the sentence");
            control.write("no action was chosen for the sentence");
            control.dec();
        } */
    }

    //res.send(resultsArr);
};
