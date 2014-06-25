/**
 * hebrew contorlller:
 * this page contains all the server and DB logic related to hebrew FN data.
 * the methods defined in this page are being used by the routes module and are depended on the models/schemes
 *
 */

printModule('controllers/hebrew');

var Models = require("../models/schemes/hebrew.js");
var luSentenceModel =require("../models/schemes/hebrew.js").luSentenceModel;
var  hebSentenceModel = require("../models/schemes/sentenceSchema.js").hebSentenceModel;
var hebBadSentenceModel =require("../models/schemes/sentenceSchema.js").hebBadSentenceModel;
var userControl = require('../controllers/users.js');
var objID = require('mongoose').Types.ObjectId;                                 //objectID type from of mongoDB
var q2coll = require('../tools/utils.js').queryToCollectionQ,
    handleHttpResults = require('../tools/utils.js').handleHttpResults,
    utils =require('../tools/utils.js');
var async = require('async');                                                   //flow control for better coding
var engControl = require("./english.js");
var extControl = require("./externalTools.js")


/******************************************READ actions****************************************/



/**
 *
 * @param req can contain id or name or q when id is number, name is string starting with capital letter, and q is json query  - using double quetes for internal strings
 * @param res
 * @param cb
 */
var loadFrame =exports.loadFrame = function loadFrame (query,proj,options,cb) {
    console.log("DEBUG: handling load-hebrew-frame request");
    var q = q2coll(query, '- @name - lexUnit.@name - -'),
        qOptions = options ? options : {limit: 50, sort: {'@name' :1}};
    Models.hebFrameModel.findOne(q,proj,qOptions,
        function(err,results){
            if (err || !results || results.length==0 || query.nofilter) return cb(err,results)
            else {
                var newRes = results['lexUnit'];
                console.log("before filter",results.to)
                newRes = _.filter(newRes, function(obj) {
                    console.log('checking for lu with stat:',obj.decision.currStat['stat']);
                    return _.indexOf(['delete', 'approve_delete', 'reject_add'], obj.decision.currStat['stat']) ==-1
                });
                results['lexUnit'] = newRes
                cb(err, results);

            }
        });
};


/**response with a json object with the data of a frame/s
 *@see API docs
 * TODO: move to routes
 * @param req
 * @param res
 */
exports.getFrame = function getFrame(req, res){
    console.log("DEBUG: handling get-hebrew-frame request");
    loadFrame(req.query,{},null,handleHttpResults(req,res))
}

/**this method returns single LU according to the requested query:
 * the query must contain - framename or frameid AND luname or luid - otherwise error will be returned
 * the query will search for the exact name (frame or lu ) - so pay attention to case sensitive
 * the response ,in case that an LU was found, will contain id of the frame, name of the frame and all the data of the SPECIFIC lu (no annotations)
 * @param req
 * @param res
 */
//TODO: need to index the luID and the lu.@name
var loadLu = exports.loadLu = function loadLu (query, proj, options, cb) {
    console.log("DDD the query is:", JSON.stringify(query))

    var qProj = proj || {"@ID":1, '@name':1, 'lexUnit':1}
    console.log("DEBUG: handling load hebrew lu request");
    if (!((query.luid || query.luname) && (query.framename || query.frameid)) ) return cb(new Error("some parameters are missing"),null);
    var resMode ='';
    query.strict=1;

    var q = q2coll(query,  '@ID @name lexUnit.@ID lexUnit.@name'),
        qOptions =options || {} ; // options ? options : {'limit' : 50, sort: {'lexUnit.@name': 1}};
    q['lexUnit'] = {'$exists':true}; //query optimization

    if (query.luid ){ //return single results - use element-match
        qProj['lexUnit'] =  { '$elemMatch': { '@ID': objID(query.luid)}}   //this options is to return only the first element in the array that matches to the query
    }
    if (query.luname ){ //return single results - use element-match
        qProj['lexUnit'] =  { '$elemMatch': { '@name': query.luname}}      //this options is to return only the first element in the array that matches to the query
    }
    console.log("DDD the query is-2:", q)
    Models.hebFrameModel.findOne(q,qProj, qOptions,function(err, results){
            if (!err && results) return cb(err, results['lexUnit'][0])
            else cb(err,results)
        }

    )
};

//bridge TODO - move to routes
exports.getLu = function getLu(req, res){
    console.log("DEBUG: handling hebrew get-lu-frame request");
    loadLu(req.query,null,null,handleHttpResults(req,res))
};




/**search in the history database  - returns all history of the object found
 *
 * @param query  - contains parameters to filter the history by - framename, luname, sentenceid (one or more), type<framelu, lusent, sentanno>
 * @param proj - will be forworded to the mongoDB query as projection parameter
 * @param options - may contain parameters such as sort, limit etc
 * @param cb
 */
function searchHistory(query, proj, options, cb){
    console.log('DEBUG: searchDecisions')
    //({framename: "asdasd",luname: "refs.luname"}, query) = > {asdasd: query['framename'], 'refs.luname': query['luname']}
    var q  =q2coll(query, '- refs.frameName - refs.luName sentenceID -')
    console.log("history query is: ", JSON.stringify(q));
    if (query['framename']) q['refs.frameName'] = query['framename'];
    console.log("history query is: ", JSON.stringify(q));
    if (query['type']) q['type']  = query['type'];
    if (query['username']) q['cBy']  = query['username'];
    if (query['decisionid']) q['_id']  = query['decisionid'];
    Models.historyModel.find(q, proj, options,cb);
}

/** @see searchHistory רק
 * TODO: move to routes
 * @param req
 * @param res
 */
exports.getSearchHistory = function(req,res) {
    console.log('DEBUG: getSearchDecisions')
    searchHistory(req.query, {},{limit:100, sort: { 'cDate': -1}}, handleHttpResults(req,res)); //'refs.frameName': 1
}



function  priorityTasks(req,res,cb){
    console.log('DEBUG: priorityTasks')
    //if (!(req.query.luid && req.query.frameid)) return cb(new Error("some of the parameters are missing"))
    //load frame data with lu
    //load the lu-sentence for this lu
    //load the sentences related to this lu
    req.query['priority']=1;
    async.parallel({
            //get the hebrew frames (names only) with priority
            frames: function(cb){

                searchFrames(req.query, {},{},cb)
            },
            //get the english lexical units list with priority
            lus: function(cb){
                searchlus(req.query,{},{}, cb);
            }/*,
             sentences: function(cb){
             //listSentences(req,res, cb);
             cb(null, ["this is a sentence", "this is another sentence"])
             }  */
        },
        handleHttpResults(req,res)
    );
}


//bridge - TODO: move to routes
exports.getPriorityTasks=function (req,res){
    console.log('DEBUG: getPriorityTasks')
    priorityTasks(req,res)
}



//TODO: sort the list before response
/**   returns names and ids of all frames, if lus=1 will return also list of related lus for each frame (under 'lexUnit=[]')
 *
 * @param query
 * @param projection
 * @param options
 * @param cb
 */
function  searchFrames(query,projection, options, cb){
    var q = q2coll(query, '@ID @name lexUnit.@ID lexUnit.@name - priority');
    //console.log('QUERY', q)

    Models.hebFrameModel.aggregate(
        {$match: q},//{frameid: Number('281') }},
        {$project: {"_id":0,'@name': "$@name", '@ID': '$@ID'}},
        {$sort: {"@name": 1}},
        cb)
};

//bridge - TODO: move to routes
exports.getSearchFrames = function (req, res){
    console.log("DEBUG: handle getSearchFrames request")
    searchFrames(req.query, {},{},handleHttpResults(req,res))
};


function searchlus(query,proj, options, cb){
    if (query.luid) query.luid = objID(query.luid); //cast String to objectID type
    var q = q2coll(query, '@ID @name lexUnit.@ID lexUnit.@name - lexUnit.priority'); //build the mongo query
    Models.hebFrameModel.aggregate(
        {$unwind : "$lexUnit" },    //this operator splits each array of lus  - to N documents - each one with single lu
        {$match: q},                //this filter the result of the prior phase
        {$project: {"_id":0,"@name":1, '@ID':1, 'lexUnit.@name':1, 'lexUnit.@ID':1,'lexUnit.@POS':1}}, //handele projection
        //{$project: {"_id":0,framename: "$lexUnit.@frame", frameid: '$lexUnit.@frameID', luname: '$lexUnit.@name', luid: '$lexUnit.@ID'}},
        {$sort: {"lexUnit.@name": 1}},
        cb)
}


//bridge - TODO: move to routes
exports.getSearchLus = function(req,res){
    console.log("DEBUG: handling hebrew getSearchLus request");
    //throw new Error("asd");
    searchlus(req.query, {}, null, handleHttpResults(req,res))
}


exports.pageFrames = function (query,res, cb){
    console.log("DEBUG: handling hebrew pageFrames request");
    var limit = _.min([20, (query.size ||30)]);
    console.log('using limit',limit)
    Models.hebFrameModel.find({},{},{sort: {'@name':1},skip: query.n*limit,limit:limit},cb)
}

//bridge TODO - move to routes
exports.getPageFrames = function (req,res) {pageFrames(req.query,res, handleHttpResults(req,res)) }



/**
 * returns a list of all the sentences in the 'sentences' collection (including which lus are related to them)
 * @param req
 * @param res
 */
function listSentences(req,res,cb){
    console.log("DEBUG: handling listAllSentences method" );
    var query=  {}, proj={};
    //if (req.query.luid) query.lus=req.query.luid;
    if (req.query.luid) query.lus=req.query.luid;     //TODO - use q2coll
    if (req.query.sentenceid) query.ID=req.query.sentenceid;


    if (req.param('valid')==1){
        proj = {'content.$':1, ID: 1}
        query['content.valid']=true;
    }
    hebSentenceModel.find(query, proj,{ sort: {ID: 1}}, function(err, results){ //TODO: add limit + paging
        if (err || !results) return cb(err,results)
        var updatedRes =  _.map(results, function(sent){
            var newSent=  sent.toObject();
            newSent['content']=newSent['content'][0]
            return newSent;
        })
        cb(err, updatedRes)
    })
};


/**
 * returns a list of all the lu-sentence relations (each sentence-lu is a record which contains list of annotations)
 * if luid or sentenceid is given - use as filter
 * @param req
 * @param res
 */
function luSentence(req,res, cb){
    console.log("DEBUG: handling luSentence method" );
    //var query ={};
    var query = q2coll(req.query, '- frameName - luName sentenceID');
    //if (req.query.sentenceid) query.sentenceID = req.query.sentenceid;
    //console.log(query)
    console.log("DEBUG-luSentence: using query:",JSON.stringify(query));

    luSentenceModel.find(query, {"_id":0, "__v":0},{sort: {'sentenceID':1}}, function(err, result){
        console.log("lu sentence reusklts num:", result.length)
        var newRes = {};
        newRes.rowData= result;
        newRes.annotations = {};
        if (result){
            for (var sen in result){
                var anno;
                var FELayer;
                var targetLayer;
                anno = result[sen]['annotations'];
                //last annotation is the valid one
                anno = Array.isArray(anno) && anno.length >0 ? anno[anno.length-1] : null;
                FELayer = anno ? _.filter(anno['layer'], function(obj) {return obj['name']=='FE'}) : null;
                FELayer = FELayer ? FELayer[0] : {name: 'FE',label: []}
                targetLayer = anno ? _.filter(anno['layer'], function(obj) {return obj['name']=='Target'}) : null;
                if (!targetLayer) console.log("ERROR: ", 'no target for this sentence - creating stub')
                targetLayer = targetLayer ? targetLayer[0] : {name: 'Target',label: [{name: 'Target',tokens: [-1]}]}
                newRes.annotations[sen] = {Target: targetLayer, FE: FELayer, sentenceID: result[sen]['sentenceID']};

            }
        }//for sentence ins result
        cb(err, newRes);
    })
}

//wrapper function for luSentence - creates a CB function
exports.getLuSentence = function(req,res){
    req.query.strict=1;
    luSentence(req,res, handleHttpResults(req,res))};


/**returns all data needed for the annotation of a LU - the frameData, the LU data, and a list of sentence data and it's lu-sentence data (with annotations if exists)
 *
 * @param req
 * @param res
 * @param cb
 */
exports.luAnnotationsData = function  luAnnotationsData(req,res,cb){
    if (!(req.param('luname') && req.param('framename'))) return cb(new Error("some of the parameters are missing"))
    req.query.valid=true;
    req.query.luid = req.param('framename')+  '#' + req.param('luname');
    //load frame data with lu
    //load the lu-sentence for this lu
    //load the sentences related to this lu
    async.parallel({
            //get the hebrew frame data - with the hebrew lus and all the FEs
            frameLU: function(cb){
                loadFrame(req.query,{},{}, cb)
            },
            //get the english lexical units list
            luSentence: function(cb){
                luSentence(req,res, cb);
            },
            sentences: function(cb){
                listSentences(req,res, cb);
                /*Models.hebFrameModel.findOne({"@ID":150}, function(err,resultObj){
                 cb(err, resultObj);
                 });*/
            }
        },
        handleHttpResults(req,res)
    );
};


/**return object of sorted FES from given list of FEs:
 * {core: [{name: thename, ID: the-@ID, def: 'the definition'}], nonCore: [{name: thename, ID: the-@ID, def: 'the definition'}] ]
 * @param fes
 * @returns {{core: Array, nonCore: Array}}
 */
function orderFes(fes){
    var core=[];
    var nonCore=[];
    for (obj in fes){ //"@coreType": "Core",
        //console.log(obj)
        if (fes[obj]['@coreType'] =='Core') core.push({name: fes[obj]['@name'], ID: fes[obj]['@ID'], def: fes[obj]['definition']}  );
        else  nonCore.push({name: fes[obj]['@name'], ID: fes[obj]['@ID'], def: fes[obj]['definition']}  );
    }
    //console.log("CORE",core);
    //console.log("nonCore",nonCore);
    return {core: core, nonCore: nonCore}
}



/**use this method in order to get all the needed data for a frame:
 * coreFE, non-core-FEs, english lus, hebrew lus
 * TODO: add retrival of the annotated sentences -hebrew and english as well
 * returned object schema:
 * {hebData: "contains hebrew-frame object (hebFrameSchema)", engData: {frame: "contains english-frame object (engllish FrameSchema)", fes:  {core: [{name: thename, ID: the-@ID, def: 'the definition'}], nonCore: [{name: thename, ID: the-@ID, def: 'the definition'}] ]}
 * @param req
 * @param res
 * @param cb
 */
exports.loadFrameData = function loadFrameData(req,res,cb){
    delete req.query['luid']
    delete req.query['luname']
    delete req.query['frameid']
    console.log("QUERY AFTER DELETE:", JSON.stringify(req.query))
    if (!req.query.framename) {return res.send(400)}
    console.log("asd")
    async.parallel({
            //get the hebrew frame data - with the hebrew lus and all the FEs
            hebData: function(cb){
                req.query.strict=1;
                loadFrame(req.query, {}, null, function(err, results){
                    //console.log('load hebrew:',results)
                    if (results) cb(err, results);
                    else cb(303, results);})
            },
            //get the english lexical units list
            engData: function(cb){
                req.query.strict=1;
                engControl.loadFrame(req.query,{},null, function(err,results){
                    if  (results && results.length >0){
                        var newResults ={
                            fes:  orderFes(results[0].frame.FE.toObject()),
                            frame: results[0].frame
                        };
                        cb(err,newResults)
                    }
                    else cb(206, results)
                });
                /*Models.hebFrameModel.findOne({"@ID":150}, function(err,resultObj){
                 cb(err, resultObj);
                 });*/
            },
            translations: function(cb){
                engControl.loadTranslations(req.query,{},null, function(err,results){
                    //console.log("TRANSALTIOSN RES:",results )
                    if  (results && results.length>0)  cb(err,results)
                    else cb(err, results)
                })
            }
        },
        function(err, results) {
            res.charset = 'utf-8'
            if (err) res.send(err);
            else res.send(results);
            //console.log(results)// results is now equals to: {one: 1, two: 2}
        });
};





function fesByFrame(fName,cb ){
    if (!fName) return cb(new Error("you must specify framename"), null)
    Models.hebFrameModel.findOne({'@name': fName}, {'FE.@name': 1 }, function(err, result) {
        console.log(err,result)
        cb(err, _.pluck(result.FE,'@name'))})

}
exports.getFes = function(req,res){fesByFrame(req.param('framename'), handleHttpResults(req,res))}


/**search all the actions - addlu, addsentence,editlu, annotatesnetence by username
 * retruns flat list of the user sorted bt the cDate (no filters)
 *  frame-cBy,lu-cBy,
 * @param username
 * @param cb
 */
function historyByUser(username, cb){
    //TODO: add filters
    console.log("DEBUG: historyByUser")
    if (!username) return cb(new Error('you must supply username'))
    var q= {'cBy': username};
    Models.historyModel.find(q,{},{sort: {cDate : -1}}, cb);

}

function historyByUser_archive(username, cb){
    //TODO: add filters
    console.log("DEBUG: historyByUser")
    if (!username) return cb(new Error('you must supply username'))
    var q= {'actions.cBy': username};
    Models.historyModel.aggregate(
        {$unwind : "$actions" },    //this operator splits each array of lus  - to N documents - each one with single lu
        {$match: q},                //this filter the result of the prior phase
        //{$project: {"_id":0,"@name":1, '@ID':1, 'lexUnit.@name':1, 'lexUnit.@ID':1,'lexUnit.@POS':1}}, //handele projection
        //{$project: {"_id":0,framename: "$lexUnit.@frame", frameid: '$lexUnit.@frameID', luname: '$lexUnit.@name', luid: '$lexUnit.@ID'}},
        {$sort: {"actions.cDate": -1}},
        cb);
}

function historyNoFrameLu(cb){
    console.log("DEBUG: historyNoFrameLu")
    //var q= {'actions.cBy': username};
    Models.historyModel.find({'type': {'$ne': 'frameLu'}},{},{limit: 50, sort: {cDate: -1}}, cb);
}

function historyAll(noLimit,cb){
    console.log("DEBUG: historyAll")
    var options = {sort: {cDate: -1}};
    if (!noLimit || noLimit !=1) options.limit=50;
    Models.historyModel.find({},{},options, cb);
}
exports.getHistoryByUser = function(req,res){
    historyByUser(req.param('user'), handleHttpResults(req,res));
}

/*heb/hist/byUser
 heb/hist/byFrame
 heb/hist/frameLu
 heb/hist/byLu
 heb/hist/sentLu
 heb/hist/luAnno*/
var histTypes = ['byUser','byFrame','byLu', 'sentLu','luAnno','frameLu' , 'noFrameLu', 'all']

function getHistoryBy (req,cb){
    console.log("get history by: ", req.param('histType'))
    var qType = req.param('histType');
    if (histTypes.indexOf(qType)===-1) return cb("invalid type!")
    var params = {type: qType};
    switch (qType){
        case ('all'):
            console.log("case ('noFrameLu')")
            return historyAll(req.param('noLimit'), cb);
            break;

        case ('noFrameLu'):
            console.log("case ('noFrameLu')")
            return historyNoFrameLu(cb)
            break;
        case ('byUser'):
            console.log("case ('byUser')")
            if (req.param('username')) params.cBy  =req.param('username');
            else return cb("username has to be supplied")
            return historyByUser(req.param('username'), cb)
            break;
        case ('byFrame'):
            console.log("case ('byUser')")
            if (req.param('framename')) {
                params.framename  =req.param('framename');
                console.log("setting framename")
            }
            else return cb("framename has to be supplied")
            break;
        default: // ('byLu' || 'sentLu' || 'luAnno' || 'frameLu'):
            console.log("case ('byLu' || 'sentLu' || 'luAnno' || 'frameLu')", qType)
            console.log("frameLu case", params)
            if (req.param('luname')) params.luname  =req.param('luname');
            else return cb("luname has to be supplied")
            if (req.param('framename')) params.framename  =req.param('framename');
            else return cb("framename has to be supplied")
            break;
    }
    listHistory(params, cb);
}



module.exports.getHistory =function(req,res){
    getHistoryBy(req,handleHttpResults(req,res));
}




















/******************************** WRITE actions ***************************************/

function validParseLU(lu){ return JSON.parse(lu)} //TODO: remove from here to schemes or utils and create validation scheme
function validParseLuReq(req){ //TODO: see validParseLU
    //if (!((query.luid || query.luname) && (query.framename || query.frameid)) )
    if (!req.param('frameid') || ! req.param('lexUnit')) return false;
    else return validParseLU(req.param('lexUnit'));
}



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

    var fieldNames =_.keys(Models.hebFrameLUSchema.tree);// ['@ID', "@name"]
    var types = _.values(Models.hebFrameLUSchema.tree);//["text", "text"]
    var fields = [];
    for (var i =0 ; i<fieldNames.length; i++){
        fields.push({'name': fieldNames[i], 'type':types[i] });
    }
    //console.log("fields\n",fields );
    console.log('sentence id: ', sentId);
    //console.log("the ajax is:",req['resJson']);
    res.render('development/addSentenceToLU.jade', {'sentJson': req['resJson'],'sentence' : sentence, 'sentenceid': sentId});
    console.log("the ajax is:",req['resJson']);
};


function valid31Format(candidate){return true;} //TODO!!! - complete this function or put as pre-save


var addLUToSentence = exports.addLUToSentence = function addLUToSentence (req,res, cb){
    console.log("DEBUG: adding the LU to the Sentence");
    var lu = req.body.luid;
    if (!lu) res.send ("please specify luid in order to add LU to the sentence")
    else{
        var sentModel = hebSentenceModel;
        //sentModel.findOneAndUpdate({},);
        console.log('DEBUG: ', 'request is: ', req.body, req['sentenceid']);
        sentModel.findOneAndUpdate({"ID": req['body']['sentenceid']}, {$addToSet: {"lus":lu}}, function(err, returnedObj) {
            if (err || !returnedObj){
                console.log('DEBUG: problem adding lu to sentence', err, returnedObj);
                if (!returnedObj) res.send("there was an error adding the lus to the sentence = object wasn't found");
                else res.send("there was an error adding the lus to the sentence");
            }else{
                res.charset= 'utf-8';
                //console.log('DEBUG: the lu ', lu, 'was added to the sentence', req['body']['sentenceid'], '\n', returnedObj);
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



/**TODO
 * check if the sentence is in the data base -search by the text linearization, return the id if in DB else return undefined
 *
 * @param sentence {indb: 'on', content:}
 * @returns {*}
 */
function isInDB(sentenceText,cb){
    console.log("DEBUG: isInDB ");
    hebSentenceModel.findOne({"text": sentenceText}, {"ID":1},function(err, resObj){
            if (!err){
                console.log("DEBUG-isInDB: text search result in sentences coll:", resObj);
                if (resObj) cb(null, resObj.ID, 'good');
                else Models.hebBadSentenceModel.findOne({"text": sentenceText}, {"ID":1},function(err, resObj2){
                    if (!err){
                        //console.log("DEBUG: text search result in badSentences coll", resObj2);
                        if (resObj2) cb(null, resObj2.ID, 'bad');
                        else cb(null, null, null);
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
function createSentenceJson(sentence, data){
    //console.log("DEBUG: createSentenceJson", typeof(sentString),"   ",sentString );
    try {
        sentence  = (typeof(sentence)=='string') ? JSON.parse(sentence) : sentence ; //make sure the sentence is object and not String!
        sentence.esId = sentence._id;
        delete sentence._id;
    }catch (er){
        return (null)

    }
    //the sentence is the new itaySentenceSchema
    return sentence;
    /*return {
     "text": sentence.text,//utils.linearizeSentence2(sentence['words']),//TODO
     "content" : [{"words": sentence['words'],valid: true}], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
     "sentenceProperties" : sentence['sentenceProperties'] = sentence,

     //"lus":[IDType],//save the related LU ids
     //"ID": sentId ? objID(sentId) : objID(),
     //"source": data ? data['source'] : 'manual'//{type: String, enum: ["corpus", "manual", "translation"]},//TODO
     };*/

}


/**process bad sentence:
 * add bad segmented sentence to the bad sentences collection in order to track the segementations in the future and to make sure that all the sentences are tracked
 * @param sentJson
 * @returns {*}
 */
function processBadSentence(sentJson, data, control, id,coll,cb){
    "add the sentence to the bad sentences collection"
    console.log("DEBUG: processing processBadSentence",id);
    //var sentObj = new badSentenceModel(sentJson);
    sentJson['ID'] = id ?id : objID();
    //TODO: need to make sure i split - if the sentence doesn't exist continue, otherwise call the 'markbad seg' finction
    new Models.hebBadSentenceModel(sentJson).save(function(err){
        if (err) {
            cb(err)
            console.log("error saving sentence", err);
            control.write("error saving sentence" + sentJson);
            control.dec();
        }
        else cb(null, "Ok, the snetence wass add to bad sentences list")
    });
}


/**add new sentence to the DB - will be called only for valid segmented sentences
 *
 * @param sentJson - valid sentence JSON, no ID
 * @returns {*}
 */
function addNewSentenceToLU(sentJson,data,control,id,coll,cb){
    console.log("DEBUG: processing addNewSentenceToLU");
    //1.add sentence to the sentences DB
    var id = objID();
    sentJson['ID'] = id;
    //2.add luid to the sentence 'lus' field
    var luid = data['framename']+'#'+data['luname'];
    sentJson['lus'] =luid;


    console.log(sentJson);
    new hebSentenceModel(sentJson).save(function(err){
        if (err) {
            cb(err)
            console.error("DEBUG-addNewSentenceToLU: error saving sentence to DB addNewSentenceToLU-phase-1" +err);
            //control.write("error saving sentence to DB addNewSentenceToLU-phase-1");
            //control.dec();
        }
        else {
            console.log('"DEBUG-addNewSentenceToLU:: the sentence was saved to DB with Id', id);
            //3. add the sentenceid, frameid, luid to the sentence-lu collection
            var luSent  = {cDate: new Date(), cBy: data.username, sentenceID: id, luname: data['luname'],luId: luid, frameName: data['framename'], text: sentJson.text};
            new Models.luSentenceModel(luSent).save(function(err){
                if (err) {
                    console.error("DEBUG-addNewSentenceToLU: error saving sentence-lu to DB addNewSentenceToLU-phase-2",err);
                    cb(err)
                    //control.write("error saving sentence-lu to DB addNewSentenceToLU-phase-2"+ err);
                    //control.dec();
                }
                else {
                    console.log("DEBUG-addNewSentenceToLU: the sentence-lu was saved", JSON.stringify(luSent));
                    cb(null, "the sentence was added succesfully to the DB and to the LU")
                    //control.write("the sentence-lu was saved "+ luSent.sentenceID + " " + luSent.luId);
                    //control.dec();
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
function addExistSentenceToLU(sentJson, data,control,id,coll,cb){
    console.log("DEBUG: processing addExistSentenceToLU",id, data['luid']);
    //1. check if we have already sentence-lu association
    //1.1 if exists - return -"association exists"
    //1.2 else:
    //1.2.1 add the lu to the sentence['lus'] list
    //1.2.2 add triple - sent-lu-frame to luSentence collection
    //var id = sentJson['ID'];
    //var luid = objID(data['luid']);
    var luid = data['framename']+'#'+data['luname'];
    console.log("DEBUG-addExistSentenceToLU:searching for id:", luid, "sentId:", id);
    //Models.hebSentenceModel.findOne({'ID':id,'lus': luid}, function(err, resObj){
    hebSentenceModel.find({'ID':id, 'lus': luid}, function(err, resObj){
        if (err) {
            console.error("DEBUG-addExistSentenceToLU: error searching for lu in sentence");
            cb(error)
            //control.write("error searching for lu in sentence");
            //control.dec();
        }
        else {
            if (resObj && resObj.length >0){
                cb(null, "OK, the sentence is already associated to the lu")
                console.log("DEBUG-addExistSentenceToLU: the sentence and lu are already associated");
                //control.write("the sentence and lu are already associated");
                //control.dec();

            }else {
                //processUnAssociated(sentJson, data);
                //1.2.1 add the lu to the sentence['lus'] list
                hebSentenceModel.findOneAndUpdate({'ID':id}, {$push: {"lus":luid}}, function(err, returnedObj) {
                    if (err) console.log("DEBUG-addExistSentenceToLU: error adding lu to sentence lus list");
                    else if (!returnedObj) {
                        cb("couldn't fint the sentence")
                        console.log("DEBUG-addExistSentenceToLU: couldn't fint the sentence");
                        //control.write("couldn't fint the sentence");
                        //control.dec();
                    }
                    else {
                        console.log("DEBUG: success - the lu was added to the sentence", id);
                        var luSent  = {cDate: new Date(), text: sentJson.text, sentenceID: id, luId: luid, frameID: data['frameid']};
                        new Models.luSentenceModel(luSent).save(function(err){
                            if (err){
                                cb("error saving sentence-lu to DB")
                                console.log(err);
                                //throw new Error("addExistSentenceToLU: error saving sentence-lu to DB addNewSentenceToLU-phase-2"+err);
                            }
                            else {
                                console.log("DEBUG-addExistSentenceToLU: addExistSentenceToLU: the sentence-lu was saved", luSent);
                                cb(null, "the sentence was added succesgully to the lu")
                                //control.write("addExistSentenceToLU: the sentence-lu was saved");
                                //control.dec();
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
 *  {inddb=objID\true\ubdefined, content=string of 31-conll sentence format (see conll31Type)}
 * @param data
 * @returns {*}
 */
//@deprecated
function processSentence(sent, data, control, sentenceNumber){
    var func;
    var action  = sent['action'];
    console.log('processing sentence number:', sentenceNumber, "action:", sent['action']);
    //var sentJson
    var sentJson  = createSentenceJson(sent['content'], data); //(sent['indb'] ? (sent['indb']) : undefined) ); //parse the sentence by schema
    var msg;

    function skipSentence (){
        console.log("no action was chosen for the sentence", msg);
        //control.write("no action was chosen for the sentence " + msg);
        control.write("OK");
        control.dec();
    }

    //
    isInDB(sentJson['text'], function(err, id, coll){
        console.log("DEBUG: processSentence CB function: received id:",id);
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


function processSentence2(sent, data, control,cb ){
    var func;
    var action  = sent['action'];
    console.log('DEBUG: processSentence2', action);
    var sentJson  = createSentenceJson(sent['content'], data); //(sent['indb'] ? (sent['indb']) : undefined) ); //parse the sentence by schema
    if (!sentJson) return cb("the sentence is not valid JSON")
    var msg;

    function skipSentence (){
        console.log("no action was chosen for the sentence", sentJson.text);
        return cb(null, "nothing need to be done")

    }


    isInDB(sentJson['text'], function(err, id, coll){
        console.log(err, id, coll)
        if (err) return cb(err);
        console.log("DEBUG: processSentence CB function: received id:",id);
        switch (action) {
            case 'badseg':
                if (id && coll=='bad') {
                    msg = id +coll
                    func=skipSentence
                }
                console.log("the id is: ", id)
                if (id && coll=='good')  return markExistSentenceBadSeg(id, cb);
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
        }
        if (func) return func(sentJson, data,  control,id, coll,cb);
        else cb("wrong action parameter")
    } );
}



function processSentence_old(sent, data, control,cb ){

    var func;
    var action  = sent['action'];
    console.log('DEBUG: processSentence2', action);
    var sentJson  = createSentenceJson(sent['content'], data); //(sent['indb'] ? (sent['indb']) : undefined) ); //parse the sentence by schema
    if (!sentJson) return cb("the sentence is not valid JSON")
    var msg;

    function skipSentence (){
        console.log("no action was chosen for the sentence", sentJson.text);
        return cb(null, "nothing need to be done")

    }


    isInDB(sentJson['text'], function(err, id, coll){
        console.log(err, id, coll)
        if (err) return cb(err);
        console.log("DEBUG: processSentence CB function: received id:",id);
        switch (action) {
            case 'badseg':
                if (id && coll=='bad') {
                    msg = id +coll
                    func=skipSentence
                }
                console.log("the id is: ", id)
                if (id && coll=='good')  return markExistSentenceBadSeg(id, cb);
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
        }
        if (func) return func(sentJson, data,  control,id, coll,cb);
        else cb("wrong action parameter")
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


/** the request should contain list of sentences, each one is an object: {action: <addtolu, badseg, nothing>, content: <a string that can be parsed to conll31type object>}
 * the request should contatin 'data' object: {'data': {framename, luname, db(haaretz, blog, manual etc)}},
 *
 * @param req - req['method']==post, req['body']= {}
 * @param res
 */
//@deprecated
exports.addSentencesToLu = function addSentencesToLu(req,res) {
    console.log("DEBUG: addSentencesToLu");//reqbody:", req.body);
    var sentences= req.param('sentences');
    var data = req.param('data')
    data.username = req.session.user.username || 'unknown'
    //options: bad segmentation - add to 'badSentences', good- add to lu? check if already in DB and in LU? else - nothing
    res.charset='utf-8';
    //console.log("DEBUG-addSentencesToLu: data->", data);
    //this is a data control object - b\c all the function are CB functions, they will update the contorl obj, the last and decrement the action counter
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

    }
};


/**add a sentence to lexical unit
 * if sentence already related to LU ->return error
 * if sentence in badSegDB ->return error
 * if sentence in goode DB:
 *      -add lu to sentenece lus list
 *      -add sentLu correlation
 *
 * @param req
 * @param res
 */
exports.addSentenceToLu = function addSentenceToLu(req,res){
    var sentence= req.param('sentence').content;
    var data = req.param('data');
    data.luid = data.framename+"#"+data.luname;
    data.username= req.user.username;
    console.log('DEBUG: addSentenceToLu',JSON.stringify(sentence))
    var params = {inputSentence: sentence,data:data}
    async.waterfall([
        function(cb){
            cb(null,params)
        },
        searchSentenceInBadSegDB, //call with error
        searchSentenceInSentencesCollection, //mark sentenceExists=true/false, create: params.sentence
        checkSentLURelation, //mark: if related -> sentenceRelated = true/false
        function(params,cb){
	    console.log('DEBUG: in anonfunc in waterfall');
            if (params.sentenceRelated){
		console.log('DEBUG: sentence is related');
                cb(null,params);
            }else if (!params.sentenceExists){
                //add sentence to database
		console.log('DEBUG: sentence is NOT related');
                console.log(params)
                addSentenceToDB(params,function(addErr,addResult){
                    if (addErr) cb(addErr)
                    else{
                        addLuSentEntry(params,cb);
                    }
                }); //creates params.sentence
            } else {
		(function(params, cb){
		    hebSentenceModel.update(
			{'ID': params.sentence.ID},
			{$push: {lus: params.data.luid}},
			function(err, results){
			    if (err) cb(err);
			    else{
				addLuSentEntry(params, cb);
			    }
			});
		})(params, cb);
	    }
        },
    ],function(err,result){
        if (err) handleHttpResults(req,res)(err);
        else handleHttpResults(req,res)(null,result);
    })
};


function searchSentenceInBadSegDB(params,cb){
    console.log('DEBUG: in searchSentenceInBadSegDB');
    hebBadSentenceModel.findOne({"text": params.inputSentence.text}, {"ID":1},function(err, result){
        if (!err){
            if (result) cb({error: "sentence is marked as bad segmented - fix first"});
            else cb(null,params);
        }else cb(err);
    });
}

function searchSentenceInSentencesCollection(params,cb){
    console.log('DEBUG: in searchSentenceInSentencesCollection');
    hebSentenceModel.findOne({"text": params.inputSentence.text}, {"ID":1,text: 1,lus:1},function(err, result){
        if (err){
            cb(err)
        }else{
            if (result) {
                params.sentence  = result.toObject();
                params.sentenceExists=true;
            }else {
                params.sentenceExists=false;
            }
            cb(null,params);
        }
    });
}

function checkSentLURelation(params,cb){
    console.log('DEBUG: in checkSentLURelation');
    params.sentenceRelated = params.sentenceExists && params.sentence;
    params.sentenceRelated = params.sentenceRelated && _.contains(params.sentence.lus, params.data.luid);
    cb(null,params);
}

function addSentenceToDB(params,cb){
    console.log('DEBUG: in addSentenceToDB')
    console.log(params)
    var inpSent = params.inputSentence;
    inpSent.esId = inpSent._id;
    var sentObj ={
        ID: objID(),
        text:  inpSent.text,
        content: [{fullSentence: inpSent,valid: true}],
        lus: [params.data.luid],
        source: 'corpus'
    }
    new hebSentenceModel(sentObj).save(function(err,result){
        if (err) cb(err)
        else {
            params.sentence = result.toObject();
            cb(null,params);
        }
    });

}


function addLuSentEntry(params,cb){
    console.log('DEBUG: in addLuSentEntry')
    var sent = params.sentence;
    var luSentObj={
        "sentenceID" : sent.ID,
        "luId": params.data.luid,
        "luName": params.data.luname,
        "frameName": params.data.framename,
        "annotations": [],
        "comments": [],
        "text": sent.text,

        cBy: params.data.username
    }
    new luSentenceModel(luSentObj).save(function(err,result){
        if (err) {
            console.error("writing luSent entry error", params.data.luid,sent.ID,err);
            //TODO: should rollback -> u are fucked
            cb(err);
        }else cb(null, params);
    })
}

exports.addSentenceToLu_OLD = function addSentenceToLu_OLD(req,res) {

    console.log("DEBUG: add sentence to lu (single sentence)");//reqbody:", req.body);
    var sentence= req.param('sentence');
    var data = req.param('data');
    //this is a data control object - b\c all the function are CB functions, they will update the contorl obj, the last and decrement the action counter
    var control = {results: [], counter : 1,
        write : function(msg){this.results = msg;},
        end: function(){res.send(this.results)},
        dec:function(){
            this.counter= this.counter-1;
            if (this.counter==0) this.end();
        } };
    processSentence2(sentence, data, control, handleHttpResults(req,res))
};



function removeSentenceFromLU(frame, lu, sentenceId,cb){
    console.log("DEBUG: removeSentenceFromLU ->",frame, lu, sentenceId);
    //delete the sentence from the sentences.lus
    var luid = frame+ '#' + lu;
    if (typeof(sentenceId) == 'string') sentenceId = objID(sentenceId)

    var sentId = sentenceId;

    hebSentenceModel.update({ 'ID': sentId, lus: luid  }, { $pull: { lus: luid } } ,function(err, results){
        console.log('phase 1 resutls:', err, results)
        //if (err || !results || results.length==0) cb(err, results)
        if (err) cb(err, results)
        else{
            console.log('phase 2 before')
            Models.luSentenceModel.remove({"frameName": frame, luName: lu, sentenceID: sentId}, function(err, results){
                console.log("deletion result:", err, results)
                cb(err,results)})

        }
    });

    //delete the sentence from the lu-sentence entry
}

exports.delSentFromLU = function (req,res){
    console.log("deleting sentence from lu", JSON.stringify(req.body));
    //res.send({results: 'OK'});
    removeSentenceFromLU(req.param('framename'), req.param('luname'), req.param('sentenceid'), handleHttpResults(req,res));


}

function markExistSentenceBadSeg(sentID, cb){
    console.log("markExistSentenceBadSeg;sentence id is:", sentID)
    hebSentenceModel.findOne({ID: sentID}, function(err, results){
        if (err || !results) return cb(err,results)
        var results= results.toObject();
        var lu;
        var fn;
        var count = results.lus.length+1;
        var delSentAndRespond = function(err2, result){
            count= count-1;
            if (count==0) {
                hebSentenceModel.remove({"ID": sentID},cb);
            }

        }
        console.log("going ot delete", JSON.stringify(results))

        for (var i in results.lus){
            console.log("results.lus[",i,']', results.lus[i])
        }
        for (var i in results.lus){
            lu = (results.lus[i]).split('#')[1]
            fn =(results.lus[i]).split('#')[0]
            removeSentenceFromLU(fn, lu, sentID, delSentAndRespond)

        }
        //add the sentence to bad segmentation colelction
        console.log("saving the sentence for bad segmentation", JSON.stringify(results));
        new Models.hebBadSentenceModel(results).save(delSentAndRespond);
    })
}


exports.markAsBadSegmentd = function (req,res){
    markExistSentenceBadSeg(req.param('sentenceid'), handleHttpResults(req,res))
}

//add the sorounding labels to array of labels and cretes FE annotation object to be saved in the DB
function createFEAnnotation(anno){
    console.log("DEBUG -createFEAnnotation - input " , anno);
    return {
        name :'FE',
        label : anno, //this needs to be the contenct form the client- array of labels  each one corresponds to 'heblabelType'
        rank : 1,
        status: 'decision'
    }
}

/**add annotation to lu, the given annotation object will be transmitted via the res.body object. in addition to luid, frameid and sentenceid.
 * the annotation will be saved in the lu-sentence collection and the annotation id will be added to the frame.lu.annotations
 *
 * @param req
 * @param res
 * @param cb
 */
exports.addAnnotation = function addAnnotation(req,res,cb) {
    console.log("DEBUG: handling addAnnotation", JSON.stringify(req.body));
    var body =req.body;
    var msgList = [];
    //check if the req contains all the relevant data
    if (!(body.framename && body.luname &&  body.annotations /*&& body.segid TODO */)) return cb(new Error("one of the parameters is missing - abort"));
    //phase 1: save new annotation to the lu-sentence collection - return error if fails to find
    var counter = body.annotations.length;
    console.log('counter value is: ',counter)
    console.log('received annotations: ',JSON.stringify(body.annotations));
    //return res.send("done");

    for (sent in body.annotations){
        console.log(body.annotations[sent]['sentenceID'])
        console.log("updating sentence",(body.annotations[sent]['sentenceID']))
        var query =  {
            sentenceID : objID(body.annotations[sent]['sentenceID']) ,
            luName : body.luname,
            frameName: body.framename
        };


        //return res.send(200, body)


        var annotation ={
            ID: objID(),
            validVersion: true,
            status: 'pending',
            cDate: new Date(),
            cBy: req.user ? req.user.username : 'unknown',
            sentenceId:  body.sentenceid,
            //segmentationID: body.segid,
            layer : []//body.annotations[sent]['FE']['label'];; //['layer'] //TODO: for now i don't deal with editing existing layers or annotations
        };

        //insert target layer
        annotation.layer.push(body.annotations[sent]['Target'])
        ////insert FE layer
        annotation.layer.push(body.annotations[sent]['FE'])


        //TODO - i stopped here!!!
        //var anno = createFEAnnotation(body.annotation)

        console.log("DEBUG-addAnnotation query is:", JSON.stringify(query));
        console.log("DEBUG-addAnnotation anno is:", JSON.stringify(annotation));
        Models.luSentenceModel.findOneAndUpdate(query, {$push: {"annotations": annotation}}, function(err, returnedObj) {
            //Models.luSentenceModel.findOneAndUpdate(query,{$push: {"annotations": {status: 'pending1'}}}, function(err, returnedObj) {
            //console.log("DEBUG-addAnnotation reulst is:", err, JSON.stringify(returnedObj))
            if (!returnedObj) {
                msgList.push("sentence doesn't exists")
            }else {
                msgList.push("annotation added, sentID: ", returnedObj.sentenceID)
                //console.log("GOOD ANNOTATION!", JSON.stringify(returnedObj))
            }
            //cb(err, returnedObj);
            counter = counter-1;
            console.log("reducing counter- counter value:", counter)
            if (counter <=0) cb(err, {status: 'OK',msg: msgList})
        });
    }


};




//addBasicLUToFrame(lu.luname,lu.lupos, frame.framename,  cb)
function addBasicLUToFrame(params, cb){
    console.log('DEBUG: addBasicLUToFrame');
    var mod = Models.hebFrameModel;
    if (!params.lu) return cb(new Error("the request is not valid"), null);
    var lu = {
        "status": 'initial',
        "sentenceCount":{
            "total": 0,
            "annotated": 0
        },
        "@name":params.lu.luname, //{required: true, type: String, match: /^.+\..+/},
        "@POS": params.lu.lupos,
        "@cDate": new Date(),
        "@cBy":params.other.username,
        "@eBy":params.other.username
    };
    lu['@eDate'] = lu['@cDate'];
    if (params.other.trans)  lu.translatedFrom = {
        "frameName":params.other.trans.framename,
        "lexUnitName":params.other.trans.luname
    };
    if (params.lu.semType) lu['semType'] =  params.lu.semType;

    //search for the frame itself - return error if not exists
    mod.findOneAndUpdate({'@name' :params.frame.framename},{'$push': {lexUnit: lu}}, {new:true},
        function(err, resu){
            //console.log('LLLL',JSON.stringify(params), err, resu)
            if (err) return cb(err, null);
            if (!resu) return cb(new Error("there was a problem with the update"), null);
            //return cb(null, {msg: 'the lu was added',content: resu2});
            return cb(null, {msg: 'the lu was added',content: resu});
        });//func2
}


// addDecision(refs, type, subtype, comment, username, cb)
/**add a new decision (annotator decision - not reviewer) to the db -
 *
 * @param refs - contatins the references - need to be relevant to the given type
 * @param type - one of frameLu, sentLu, luAnno
 * @param subtype - add, remove, query
 * @param comment
 */
function addDecision(params, type, cb){
    console.log('DEBUG: addDecision')
    var histObj= {
        refs : {
            frameName: params.frame.framename,
            luName: params.lu.luname
        },
        cBy: params.other.username,
        cDate: new Date(),
        action:  params.other.action,
        comment: params.other.comment,
        type: type,
        text: params.other.username + (params.other.action =='add' ? ' added ' : ' deleted ')  + 'the LU [' + params.lu.luname +'] to/from frame [' +  params.frame.framename+ ']'

    }
    var histObjInstance = Models.historyModel(histObj)
    histObjInstance.save(cb);
}//adddecision


function addDecision1(params, type, cb){
    console.log('DEBUG: addDecision')
    var refs = {
        frameName: params.frame.framename,
        luName: params.lu.luname
    }
    var action = {
        cBy: params.other.username,
        cDate: new Date(),
        type:  params.other.action,
        comment: params.other.comment
    }
    var query = {
        type: type,
        refs: refs
    }
    Models.historyModel.findOneAndUpdate(
        query,
        {'$push': {actions: action}},  //update
        {new:true, upsert: true}, cb)   //options (upsert  = create new object if not exists)
}//adddecision


//(refs.luname, refs.frameName, subtype,username

function setLUdecisionStatus(params, cb){
    console.log('DEBUG: setLUdecisionStatus', JSON.stringify(params))
    var update = {};
    //case: this is add or remove action
    if (-1 != _.indexOf(['add','delete'], params.other.action)){
        update = {'$set':{
            'lexUnit.$.decision.currStat.stat': params.other.action,
            'lexUnit.$.decision.currStat.cBy': params.other.username,
            'lexUnit.$.decision.currStat.cDate': new Date()
        }};
    }
    //case: this is a query action
    //case: this is a reviewer decision
    else if (params.other.action != 'query' )
        update = {'$set':{
            'lexUnit.$.decision.appStat.stat': params.other.action,
            'lexUnit.$.decision.appStat.cBy': params.other.username,
            'lexUnit.$.decision.appStat.cDate': new Date()
        }};
    update['$set']['lexUnit.$.translatedFrom']= params.lu.trans
    console.log("update::", JSON.stringify(update))
    Models.hebFrameModel.findOneAndUpdate(
        {'@name': params.frame.framename, 'lexUnit.@name': params.lu.luname},
        update,
        cb
    )
}


//get list of lus in frame, returns only the lus which their status is noe 'delete' 'approve_delete', 'reject_add'  - meaning only the approved added lus
function filterByStatus(lus){
    return _.filter(lus, function(obj) {
        return _.indexOf(['delete', 'approve_delete', 'reject_add'], obj.decision.currStat['stat']) ==-1
    });

}
/**adds a decision to the history collection and update the 'decision' field in the lexUnit object
 *
 * @param params
 * @param type
 * @param callBack
 */
function addFrameLuDecision(params, type, callBack){
    console.log('DEBUG: addFrameLuDecision')
    async.parallel({
            luHistory: function(cb) {
                console.log("111111")
                addDecision(params, type, cb)
            },
            lexUnit: function(cb) {
                console.log("22222")
                setLUdecisionStatus(params,

                    function(err,results) {

                        var newRes =results;
                        if (newRes){
                            newRes=newRes.lexUnit;
                            newRes   = filterByStatus(newRes);
                        }
                        cb(err, newRes)
                    }
                )},
            status: function(cb){cb(null,'OK')}  //TODO: what is this???
        },
        callBack)
}



/*
 pseudo code:
 addFrameLuAssociation(luname,framename,action){
 if !luinframe(luname,framename):
 if (action==delete) - throw exception
 else
 addlutoframe(luname, lupos,framename)

 setframeLudecision(fname,luname, action)
 */
function getSemTypes(params,cb){
    console.log("semType!!")
    if (params.other.trans)
        engControl.getSemTypes({'framename':params.other.trans.framename, luname: params.other.trans.luname}, cb)
    else cb(null,[]);
}

//TODO: updating multiple collections - add roleback on error option
//add or remove lu to/from frame
function createFrameLuAssociation(params, cb){
    console.log('DEBUG: frameLuAssociationAction')
    //validate: luname is given
    if (!params.lu.luname) return cb(new Error("you must specify lu name (lu.luname) in the request"))

    //check if the lu already associated to the frame
    //first - fetch the frame's lus list
    Models.hebFrameModel.findOne({'@name': params.frame.framename}, {'lexUnit.@name':1},
        function(err,results){
            console.log("DEBUG: frameLuAssociationAction->findOne")
            if (err) return cb(err)
            if (!results) { //if frame doesn't exists!
                return cb(new Error("the requested frame doesn't exists"))
            }
            //if action==delete and the lu is not in the frame
            else //frame exists
            {
                var luexists = _.find(results.lexUnit, function(obj){return  obj['@name']== params.lu.luname}); //check - lu in frame?
                if (!luexists &&  params.other.action=='delete'){ //trying to delete non associated lu - error
                    return cb(new Error("you cannot delete lu from frame if it is not added first"));
                }
                else {
                    if (!params.lu.lupos) return cb(new Error("you have to specify the POS of the lexical unit before adding it to frame"))
                    if (!luexists)                //case: the lu is new - add to frame and then add to lu
                        getSemTypes(params,  //get the semTypes if exists any from the english lu and add them as default to the hebrew lu  - in case that the lu was translated
                            function(err,results){
                                if (err )  return cb(err);
                                if (results != []) params.lu.semType = results;
                                console.log("the sem types are",params.lu.semType )
                                addBasicLUToFrame(params,
                                    function(addError, addResult){
                                        addFrameLuDecision(params,'frameLu',cb)
                                    });
                            });
                    else addFrameLuDecision(params,'frameLu',cb)
                }
            }
        })
}

//actions: add_approve, add_reject, delete_approve, delete_reject
function setDecisionApproval(params, cb){
    if (!params.other.decisionid) return cb(new Errr("you must supply valid decisionid"));
    //console.log("PARAMS2",params)
    if (params.other.action.indexOf('approve')==-1 && params.other.action.indexOf('reject')==-1 ) return cb(new Error("the action is not valid"));
    Models.historyModel.update(
        {'refs.frameName': params.frame.framename, 'refs.luName': params.lu.luname, '_id': params.other.decisionid},
        {'$set':{
            'revCall': params.other.action}},
        function(err,results){
            if (err) return cb(err)
            if (!results) {
                console.log("some problem with the setDecisionApproval")
                return cb(new Error("some problem with the setDecisionApproval"))
            }
            //console.log("STEP1 results:", results)
            createFrameLuAssociation(params, cb);
        })
}




/**  wrapper function - checks validity of the parameters, parse theme and initiate the createFrameLuAssociation function  OR setDecisionApproval
 * user this function in order to set a new frame-lu decision or to approve or reject one
 *
 * @param req
 * @param res
 */
exports.postCreateFrameLuAssociation = function(req,res){
    //TODO: check that the frame exists before posting a decision? make sure
    //TODO: organize the validation of data - it's critical here (check the lu name, etc)
    console.log('DEBUG: postFrameLUDecision', req.body)
    if (req.param('luname') && req.param('lupos') && req.param('luname').indexOf('.')==-1 ) req.body.luName = (req.param('luname') + '.'+req.param('lupos')).toLowerCase();
    if (req.query.luname ) if (req.param('luname') && req.param('lupos') && req.param('luname').indexOf('.')==-1 ) req.query.luname = (req.param('luname') + '.'+req.param('lupos')).toLowerCase();
    var params = utils.parseReqParams(req)
    console.log('PARAMS:',JSON.stringify(params))
    var valid = (params.other.action && (-1 != _.indexOf(['add', 'delete', 'query'], params.other.action)))
    valid = valid &&  params.frame.framename &&  params.lu.luname
    if (!valid) throw new  Error("the selected action is not valid or some parameters are missing " + valid)
    createFrameLuAssociation(params, handleHttpResults(req,res));
}

/**this function revieves an edited lu and saves it to the DB - all the given parameters will be changed (no roll back!)
 *must contain at least - luname
 * @param params
 * @param cb
 */
function editLU(params, cb){
    //[{asdas: asdasd, asd:{asdas:asdasd},asda:[{asd:asd}]}]
    //verify that  both framename and luname are supplied
    if (!params.frame.framename || !params.lu.luname) return cb(new Error('framename and luname must be supplied'));
    var lu =params.lu;

    //create semType list of objects of type semType (without ID)
    lu.semType = _.map(lu.semType, function(obj){ return {'@name': obj.trim()}});
    var query = { //specify the lu to edit by fName and luName
        '@name': params.frame.framename,
        'lexUnit.@name': lu.luname};
    var fields = {
        'lexUnit.$.definition': lu.definition,
        'lexUnit.$.status': lu.status,
        'lexUnit.$.lexeme': lu.lexeme,
        'lexUnit.$.semType': lu.semType,
        'lexUnit.$.@lemma': lu.lemma,
        'lexUnit.$.@incorporatedFE' : lu.incoFe ? lu.incoFe : '', //default empty string
        'lexUnit.$.@eDate' : new Date(),
        'lexUnit.$.@eBy': params.other.username,
        'lexUnit.$.translatedFrom' : lu.trans
    };
    console.log("DEBUG: lu.trans in edit lu", lu.trans);
    var update = {'$set':  (fields)};
    var updateOptions={};  //set options if needed, see mongoose docs

    //console.log("EDITLU:", JSON.stringify(query), JSON.stringify(update));
    Models.hebFrameModel.update(query, update, updateOptions, cb);
}//editLU




exports.postSetDecisionApproval = function(req,res){
    console.log('DEBUG: postFrameLUDecision')
    var params = utils.parseReqParams(req)
    //var valid = (params.other.action && (-1 != _.indexOf(['add_approve', 'add_reject','delete_approve', 'delete_reject' ], params.other.action)))
    var valid = (params.other.action && (-1 != _.indexOf(['approve', 'reject' ], params.other.action)))
    valid = valid &&  params.frame.framename &&  params.lu.luname && params.other.decisionid
    if (!valid) throw new  Error("the selected action is not valid or some parameters are missing")
    setDecisionApproval(params, handleHttpResults(req,res));
}


var editLuProj = {definition:1, '@name':1, '@POS':1, 'status':1, 'lexeme':1, '@lemma':1, semType:1, '@incorporatedFE':1 }
//bridge=TODO: move to routes
exports.posteditLU = function(req,res){
    var params = utils.parseReqParams(req, 'editlu')

    editLU(params,handleHttpResults(req,res))

}

//add/remove/update item from the locks list
function updateLockInterval(action, frame, lu, uname, cb){
    return function(err, results){
        if (err || !results)  return cb(err, results)
        if (action=='free'){
            //release the lock from live lock

        }
        else if (action=='lock'){


        }



    }


}
function lockLu(action, frame, lu, uname ,cb){
    var hours = 1;
    //lock the lu:
    //case 1: it is free
    //case 2: it is locked by me (renew lock)
    //case 3: it is locked for more than two hours

    if (action == 'lock'){
        console.log("DEBUG: locking lu",frame, lu)
        Models.hebFrameModel.findOneAndUpdate(
            {'@name': frame,'lexUnit.@name': lu,

                '$or': [
                    {'lexUnit.locked': false},
                    {'$and': [{'lexUnit.locked': true}, {'lexUnit.lockedBy': uname}]},
                    {'lexUnit.lockTime': {'$lt': (new Date()-60*1000)}}//new Date(new Date().getTime() - hours*3600*1000)}}
                ]},
            {'$set': {'lexUnit.$.locked': true, 'lexUnit.$.lockedBy': uname, 'lexUnit.$.lockTime': new Date()}},
            cb)
        //updateLockInterval('lock', cb))
    }
    //usage: explicitly exiting lu edit mode
    else if (action == 'free'){
        console.log("DEBUG: free lu lock",frame, lu)
        Models.hebFrameModel.findOneAndUpdate({'@name': frame,'lexUnit.@name': lu, 'lexUnit.locked': true, 'lexUnit.lockedBy': uname},
            {'$set': {'lexUnit.$.locked': false, 'lexUnit.$.lockedBy': null}},
            cb) //updateLockInterval('free',frame, lu, cb))
    }
    else if (action == 'check') {
        console.log("DEBUG: checking lu lock",frame, lu)
        Models.hebFrameModel.findOne({'@name': frame,'lexUnit.@name': lu}, {'lexUnit.$.locked':1},cb)

    }

}


exports.luLock= function(req,res){
    //TODO - validate parameters
    lockLu(req.param('action'),req.param('framename'), req.param('luname'), req.user && req.user.username || 'unknown', handleHttpResults(req,res))
}



/*var historySchema22 =  {

 type: {type: String, enum: ['framelu', 'lusent', 'sentanno']},
 refs: {luName: String, sentenceID: ObjectId, frameName: String},
 actions : [{
 cBy: String,
 cDate: Date,
 type: {type:String, enum:['add','remove','query']},
 comment: String,
 discussionid: ObjectId,
 revCall: {type: String, enum: ['approved','rejected']}}]
 } //history schema    */

//----lu-sentence: framename,luname,sentenceid, sentence text, username, cDate action  ('sentence was added', 'sentence was removed')
//----sentence-annotation (framename, luname, sentenceid), username, cDate, action ('X annotated this sentence')
function createHistStr(type, params){
    if (type === 'sentLu'){
        return params.username + ' added sentence to lu ['+params.luname+'] in frame ['+params.framename +']. the added sentence is: ' +params.sentText;
    }else if (type ==='luAnno'){
        return params.username + ' added annotation to a sentence in lu ['+params.luname+'] in frame ['+params.framename +']. the annotated sentence: ' +params.sentText;
    }else
        return false
}


//add annotation feed or lu-senetence feed to a collection
function addHistoryFeed(params, cb){
    //
    var timeStamp = new Date();
    var id = objID();
    var histObj ={
        _id: id,
        type: params.type,  //'lusent' or 'sentanno'
        refs: {
            frameName: params.framename,
            luName: params.luname,
            sentenceID: params.sentenceid
        },
        cDate : timeStamp,
        cBy: params.username,
        text: createHistStr(params.type, params)
    };
    var histMod = new Models.historyModel(histObj)
    histMod.save(cb);
};


module.exports.postHistoryFeed = function(req,res){
    var params = {
        type: req.param('type'),
        luname: req.param('luname'),
        framename: req.param('framename'),
        username: req.user && username || 'unknown',
        sentenceid: req.param('sentenceid'),
        sentText : req.param('sentencetext')
    };
    addHistoryFeed(params, handleHttpResults(req,res));
};

function listHistory(params, cb){
    console.log("DEBUG: listHistory");
    console.log("params- list history", JSON.stringify(params))
    var type = params.type;
    var query ={};
    //'refs.luName' : params.luname,
    //'refs.frameName' : params.framename
    switch (type){
        case ('byFrame') :
            query['refs.frameName'] = params.framename;
            break;
        case ('frameLu'):
            query['type'] = 'frameLu';
            break;
        case ('byLu'):
            query['refs.frameName'] = params.framename;
            query['refs.luName'] = params.luname;
            break;
        case ('sentLu'):
        case ('luAnno'):
            query['refs.frameName'] = params.framename;
            query['refs.luName'] = params.luname;
            query['type'] = type;
            break;
        default :
            return cb(new Error("invalid type in 'listHistory': ", type))

    }
    Models.historyModel.find(query,{},{limit: 20, sort: {'cDate' : -1}} ,cb);
}

module.exports.getHistoryByType = function(req,res){
    var params = {
        type: req.param('type'),
        luname: req.param('luname'),
        framename: req.param('framename'),
        username: req.user && username || 'unknown' //TODO: maybe change to specific 'by user' ant not by session
    };

    console.log('params: ', JSON.stringify(params))
    listHistory(params, handleHttpResults(req,res))
};




function validateFields(names,params, cb){
    var vars  = names.split(' ');
    for (var name in vars){
        if (!params[vars[name]]) {
            cb(new Error('one of the parameters is missing'));
            return false;
        }
    }
    return true;
}



/*comments:
 --add commenting option for each type:
 -----frame (comments about the frame "i think הלך.v need to be in this frame, what do you think?") (framename)
 -----lu  (comments about the lu - i think this lu need to have diffrent lemma/semtype etc) (luname, framename)
 -----sentence-lu (i don't think this sentence needs to be in this lu, comments about annotations) (luname, framename, sentenceid)
 */
function addComment(params, cb){
    var comment = {
        cBy: params.username,
        content: params.comment,
        cDate: new Date()
    };
    switch (params.type){
        case 'frame':
            if (!validateFields('framename comment', params,cb)) break;
            Models.hebFrameModel.findOneAndUpdate({"@name": params.framename}, {$addToSet: {"comments": comment}}, cb );
            break;
        case 'lu':
            if (!validateFields('framename luname comment', params,cb)) break;
            var query = {'@name': params.framename, 'lexUnit.@name': params.luname};
            var fields = {'lexUnit.$.comments': comment};
            var uOptions={}; //{new : true};
            var update = {'$set':  (fields)};
            Models.hebFrameModel.update(query, update, uOptions, cb);
            break;
        case 'sentlu':
            if (!validateFields('framename luname sentenceid comment', params,cb)) break;
            Models.luSentenceModel.findOneAndUpdate(
                {"frameName": params.framename, luName: params.luname, sentenceID: params.sentenceid},
                {$addToSet: {"comments": comment}},
                cb );
            break;
        default :
            cb("the type doesn't match");
    }

}


module.exports.postAddComment = function (req, res){
    var params = {
        type: req.param('type'),
        luname: req.param('luname'),
        framename: req.param('framename'),
        username: req.user && username || 'unknown',
        sentenceid: req.param('sentenceid'),
        comment : req.param('comment')
    };
    addComment(params, handleHttpResults(req,res))
};



function listComments(params,cb){
    console.log('DEBUG: ', 'listComments', params.type);
    switch (params.type){
        case 'frame':
            if (!validateFields('framename', params,cb)) break;
            Models.hebFrameModel.findOne({"@name": params.framename}, {comments: 1},
                function(err,results){
                    if (err || !results) cb(err,results);
                    else cb(null, results.comments);
                } );
            break;
        case 'lu':
            if (!validateFields('framename luname', params,cb)) break;
            var query = {'@name': params.framename, 'lexUnit.@name': params.luname};
            var proj = {'lexUnit.$.comments': 1, 'lexUnit.comments': 1};
            Models.hebFrameModel.findOne(query, proj, function(err, results){
                if (err || !results) cb(err,results);
                else if (!results.lexUnit) cb(null,[]);
                else cb(null, results.lexUnit[0].comments);
            });
            break;
        case 'sentlu':
            if (!validateFields('framename luname sentenceid', params,cb)) break;
            console.log("sent lu!!")
            Models.luSentenceModel.findOne(
                {"frameName": params.framename, luName: params.luname, sentenceID: params.sentenceid},
                {"comments": 1},
                function(err, results){
                    if (err || !results) return cb(err,results);
                    else cb(null, results.comments);
                }
            );
            break;
        default :
            cb(new Error("the type doesn't match"));
    }
}

module.exports.getComments = function (req,res){
    var params = {
        type: req.param('type'),
        luname: req.param('luname'),
        framename: req.param('framename'),
        sentenceid: req.param('sentenceid')
    };

    listComments(params, handleHttpResults(req,res))
}


function calcLusProgress(fn, orig_cb){
    console.log('DEBUG: calcLusProgress')
    return engControl.countLus(fn,function(e,r){
        console.log("eng result:", e, r);
        var matchQ = {'lexUnit': {$exists: true}, 'lexUnit.decision.currStat.stat': 'add'}
        if (fn) matchQ['@name'] =fn;
        Models.hebFrameModel.aggregate(
            {'$project': {"_id":0,'lexUnit.@name': 1, '@name':1,'lexUnit.decision.currStat.stat': 1}},
            {$unwind : "$lexUnit" },
            {$match: matchQ},
            function(e2,r2){
                console.log('almost there', e2, JSON.stringify(r2))
                if (!e2)
                    orig_cb(e2,
                        {prec: (r2.length/r*100).toFixed(1), engCount: r, hebCount:  r2.length})
                else orig_cb(e2);


                //orig_cb(e,r)
            })
    })

}


exports.getLusProgress = function (req,res){
    //if 'frameName' is not given, the query will be about all the frames
    calcLusProgress(req.param('frameName'), handleHttpResults(req,res))
}


function setSentLuCorrelation(query,cb){ //TODO: define the scheme - for now it is defined as 'not strict'
    updateQuery = {status: query.status};
    console.log(query.comment);
    if (query.comment) updateQuery.comment = query.comment;
    Models.luSentCorrelationModel.update({luName: query.luname, frameName: query.framename, esSentId: query.sentid, text: query.text}, updateQuery, {upsert: true}, cb);

}

module.exports.setLuSentCorr = function (req,res){
    console.log(req.method);
    var q = (req.method == 'GET') ? req.query : req.body;
    setSentLuCorrelation(q, handleHttpResults(req,res));
}

function getSentLuCorrelation(query,cb){
    Models.luSentCorrelationModel.findOne({luName: query.luname, frameName: query.framename, esSentId: query.sentid},  cb);

}

module.exports.getLuSentCorr = function (req,res){
    console.log(req.method);
    var q = (req.method == 'GET') ? req.query : req.body;
    getSentLuCorrelation(q, handleHttpResults(req,res));
}




function sentencesByLu(query,cb){
    Models.luSentCorrelationModel.find({luName: query.luname, frameName: query.framename},  cb);

}

module.exports.getSentencesByLu = function (req,res){
    console.log(req.method);
    var q = (req.method == 'GET') ? req.query : req.body;
    sentencesByLu(q, handleHttpResults(req,res));
}





































