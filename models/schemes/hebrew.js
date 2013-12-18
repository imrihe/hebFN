/**
 * data schemes
 * the idea is: each dataType in the DB will have it's own scheme.
 *              additionally - every scheme defines scheme unique methods (such as getters and setters) when needed - those methodes will be exposed to each object of the scheme
 *              in order to save\insert new document into the DB - we will firest define suitable model (by scheme) and then call the NEW operator with the document data.
 *              in order to query the DB - we will do modelName.find() \findOne() etc. - the result will be returned to the calledBack function sent
 */
//TODO: think - every field that appears in the schema will always be pulled and saved and casted by it's defined type, if i delete the field - it won't apper if it's empty..
//maybe it's better to work with partial schemas
//TODO: add static methodes to the schemas - http://mongoosejs.com/docs/guide.html#staticss

//TODO: _id field and schema or JSON decisions
//arrays done: FEType, semTypeRefType(_id:false),heblexemeType(_id:false), memberFEtype{_id:false} ,relatedFramesType{_id:false}, inquiryType(SCHEMA),
//annotatedSentenceType,heblayerType(_id:false),heblabelType(_id:false),ConllJson31Type(_id:false), wordType(_id:false),
//simple done: countType,   extSentRefType, RGBColorTypem orderType  , defType  ,frameNameType,hebPOSType,dateTimeType,valencesType
//handle: IDType,ObjectId, hebFrameLUSchema



printModule('models/schemes/hebrew');


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    //Model = mongoose.model;
var coll=global.conf.coll;

//import general types:
var types = require('./generalTypes.js');
//import basic Types
var ObjectId =types.ObjectId,
    IDType =types.IDType,
    orderType = types.orderType,
    frameNameType = types.frameNameType,
    dateTimeType = types.dateTimeType,
    countType = Number,
    //POSType =types.POSType,
    defType = types.defType,
    RGBColorType =types.RGBColorType,
    coreType = types.coreType;

//var labelSpanType = new Schema({type: Number, min:0});//"description" : "a numeric type to use for Label spans",
var extSentRefType =types.extSentRefType;// {type: Number, min: 0}; //			"description": "a numeric type to use for external references to sentences (aPos)",
var annoSetType =types.annoSetType;
var governorType = types.governorType;
var FEValenceType =types.FEValenceType;
var valenceUnitType = types.valenceUnitType;
var FERealizationType  = types.FERealizationType;
var FEGroupRealizationType =types.FEGroupRealizationType;
var valencesType = types.valencesType;

//description": "a string type for FE core types",
/**semTypeRefType
 * same for english and hebrew
 */
var semTypeRefType = types.semTypeRefType;

/**
 * same in hebrew
 * @type {Schema}
 */
var internalFrameRelationFEType  =types.internalFrameRelationFEType;

/** FEType
 * same in hebrew
 * @type {Schema}
 */
var FEType =  types.FEType;

/**relatedFramesType
 * same in hebrew
 */
var relatedFramesType =types.relatedFramesType;

/**memberFEtype
 * same in hebrew
 * @type {Schema}
 */
var memberFEtype   = types.memberFEtype;


/*********************** hebrew schemes:*******************************/
//missing: history, annotatorDecisions,inquiryType

/**
 * general types
 *
 */
var hebPOSType = {required: true, type: String, enum:  [ "N","V", "A", "ADV","PRON","PREP","NUM","C","INTJ","ART","SCON","CCON","AVP"]};

/**
 * hebrew corpora schema
 * "description":"contains information about the different corpora used.",
 */
var corporaSchema = new Schema({
    "id":IDType,
    "name": String,
    "description": String,
    "status":{"type":String, enum:["active","requested","unactive","wip"]}
});

var commentType = new Schema({
    cBy: String,
    content: String,
    cDate: Date
})
/**
 * "description":"an attributes-only lexeme element",
 * @type {Schema}
 */
var heblexemeType =new Schema({
    "name": String,
    "POS":hebPOSType,
    "breakBefore":Boolean,
    "headword":Boolean,
    "order":orderType
},{_id:false});



/**  hebType
 *"description":"frame-embedded lexUnit type",
 * @type {Schema}
 * each lu will have an _id - the _id will be it's identifier in the entire database. and is of type ObjectID
 */
var hebFrameLUSchema = exports.hebFrameLUSchema = new Schema({
    //"_id": ObjectId,
    "priority": Number,
    "definition": defType,
    "frameID": IDType,
    "frameName": String,
    "status":{type: String,enum: ["initial","completed"]},//{type: String,enum: ["approved","pending"]}, - relating to lu data - if not 'complete'  - not possible to add sentences??
    "translatedFrom"://"description":"holds information regarding the english lexical unit which this lexical unit was translated from",
    {
        "frameName":String,
        "luID": String,
        "luName": String
    },
    //"description":"contains information regarding the sentences of this lexical unit",
    "sentenceCount":{
        "total":countType,
        "annotated":countType
    },
    "lexeme":[heblexemeType],
    "semType": {type : [semTypeRefType], required: false},
    "valences": valencesType,
    "annotations":[IDType], //TOOD: change to objID
    "@ID":ObjectId,//{type: Number ,unique: true, auto: true},//TODO: use _id field
    "@name":{required: true, type: String, match: /^.+\..+/},
    "@POS": hebPOSType,
    "@lemmaID":IDType,
    "@lemma":String,
    "@incorporatedFE":String,
    "@status":{type: String, match: /^[A-Z].*/},
    "@cDate": dateTimeType,
    "@cBy":String,
    "@eDate":dateTimeType,     //e= edited
    "@eBy":String,
    "locked": Boolean,
    "lockedBy": String,
    "lockTime" : Date,
    "decision":{
        currStat: {stat: String, cBy: String, cDate : Date},
        appStat: {stat: String, cBy: String, cDate: Date}
    },
    "comments": [commentType]
},{strict: false}); //{_id: false}




var historySchema =  new Schema({
    type: {type: String, enum: ['byUser','byFrame','byLu', 'sentLu','luAnno','frameLu']},
    refs: {luName: String, sentenceID: ObjectId, frameName: String},
    action: {type:String, enum:['add','delete','query']},
    cBy: String,
    cDate: Date,
    comment: String,
    revCall: {type: String, enum: ['approved','rejected']}
}, {strict: false}) //history schema


var historySchema_archive =  new Schema({

    type: {type: String, enum: ['byUser','byFrame','byLu', 'sentLu','luAnno']},
    refs: {luName: String, sentenceID: ObjectId, frameName: String},
    actions : [{
        cBy: String,
        cDate: Date,
        type: {type:String, enum:['add','remove','query']},
        comment: String,
        discussionid: ObjectId,
        revCall: {type: String, enum: ['approved','rejected']}}]
}, {strict: false}) //history schema



/**
 * hebrew frame schema
 * "description":"Contains information about the frame: definition, priority,semantic type, frame elements, core frame element, frame relations, and lexical units; does not contain annotations.",
 * @type {Schema}
 */
var hebFrameSchema = exports.hebFrameType = new Schema({
        "@ID": IDType,
        "@name": frameNameType,
        "@cDate": dateTimeType,
        "@cBy": String,
        "definition": defType,
        "source" : String,
        "priority": Number,
        "semType":{type: [semTypeRefType], required: false}, //same type as english
        "FE": [FEType] ,
        "FEcoreSet": [memberFEtype], //occurrences: 0+
        "frameRelation": [relatedFramesType],
        "lexUnit": [hebFrameLUSchema],
        "comments" : [commentType]
});


/**
 * this is how the word (in a snetnece)is represented according to alon's search engine,
 * TODO: add description to each one of the fields
 * @type {Schema}
 */
var wordType = new Schema({

    //basic morphological data:
    ID: Number,
    "word": String, //originally  -'form'
    "lemma": String,
    "cpos" : String, //TODO - enum
    "pos": String, //TODO - enum
    "prefix": String,
    "base": String,
    "suffix": String,
    //FEATS
    "gender":{type : String, enum: ['_','m', 'f', 'mf']},
    "number":{type: String, enum: ['sp','s','p','d','dp','_']},// "comment" : "singular/plural or non. check if plural is signaled by p!",
    "construct": String,
    "polarity": {type: String}, //  "comment" : "probably contains: (pos) | (neg) | _"
    "person":{type: String},//, enum: ['1','2','3']},
    "tense": String,
    "def": Boolean,
    "binyan" : {type: String, enum: ['PAAL','NIFAL','HIFIL','HUFAL','PIEL','PUAL','HITPAEL', '_']},
    "otherFeats" : String,
    //FEATS-end

    //dependency related data:
    "deprel": String, //TODO - enum
    "head" : String,  //Number
    "Phead" : String, //Number
    "pdeprel": String, //TODO - enum


    //extra calculated fields:
    "height": Number,
    "id": Number,
    "pardist": Number,
    "parpos": String,
    "parword": String,
    "special": Boolean,
    "specTrans" : String
},{strict: false});


var wordType2 = new Schema({
    "word": String,
    "prefix": String,
    "base": String,
    "suffix": String,
    "lemma": String,
    "pos": String,
    "postype": String,
    "gender":{type : String, enum: ['_','m', 'f', 'mf']},
    "number":{type: String, enum: ['sp','s','p','_']},// "comment" : "singular/plural or non. check if plural is signaled by p!",
    "construct": String,
    "polarity": {type: String}, //  "comment" : "probably contains: (pos) | (neg) | _"
    "person":{type: String},//, enum: ['1','2','3']},
    "tense": String,
    "def": Boolean,
    "pconj": Boolean ,
    "pint": Boolean,
    "pprep": Boolean,
    "psub": Boolean,
    "ptemp": Boolean,
    "prb": Boolean,
    "suftype": String,
    "sufgen": Boolean,
    "sufnum": String,
    "sufperson":{type: String},//, enum:['1','2','3']},
    "chunk": String,
    "height": Number,
    "id": Number,
    "parid": Number,
    "pardist": Number,
    "parpos": String,
    "parword": String
},{_id:false});

var wordType1 = new Schema({
    id: String,
    word: String,
    f2: String,
    pos1: String,
    pos2: String,
    tags: String,
    parID: String,
    role: String,
    f8: String,
    f9: String
}, {_id: false});

//ConllJson31Type
/**TODO: complete this according to alon's type - 31 json response
 *comment : "the json as received by alon's search tool",
 * @type {Schema}
 */


var ConllJson31Type = new Schema({
    sentenceProperties: {
        "length" : Number,
        "wordsNum": Number,
        "height" :Number,
        "root_location" :Number,
        "root_pos" : String,
        "pattern" :  String
    },
    "words" :[wordType],
    "valid": Boolean,
    "text": String
    //"original": Boolean
},{_id:false});


//var ConllJson31Type = require('sentenceSchema.js').sentenceSchema;

/**
 *"description":"sentence will contaion the basic POS, parse trees and morphology along with list of annotationSet ids",
 * @type {Schema}
 */
var hebsentenceSchema = exports.hebsentenceSchema = new Schema({
    "text":String,
    "content" : [ConllJson31Type], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
    "lus":[String],//save the related LU ids framename_luname
    "ID":ObjectId,
    "source": {type: String, enum: ["corpus", "manual", "translation"]},
    //"comment":"sentences can also be manually inserted",
    "sentenceOrigin": {
        "aPos": extSentRefType,
        "paragNo":orderType,
        "sentNo":orderType,
        "docId":IDType,
        "corpID":IDType
    }
},{strict:false});

var heblabelType = new Schema({
    "name":String,
    "tokens":[Number],//"comment" : "contains the index of the words found in the relevant sentence",
    "fgColor":RGBColorType,
    "bgColor":RGBColorType,
    // "comment":"for null instantiation",
    "itype":{type: String, enum: ["APos","CNI","INI","DNI","INC"]},
    "feID":IDType //contatins the relevant FE if this is part of FN annotation layer
},{_id: false});

/**each layer will have it's own type (name) - dependency, FN annotations, constituency etc
 *
 * @type {Schema}
 */
var heblayerType = new Schema({
            "label":[heblabelType],
            "name":String,
            "rank":orderType,
            "status":{type: String, enum: ["approved","decision","inquiry","temporary"]}
},{_id:false});//TODO: decide if id is needed? no!



/**each annotation will be embedded in a sentence and one of it's segmentation,
 * only the annotations which are related to the valid segmentation will be count as valid
 *
 * @type {Schema}
 */
/*var hebannotationSetType = exports.hebannotationSetType = new Schema({
    "ID":IDType,
    "sentenceID":IDType,
    "conllID": IDType,
//    "segmentation": segmentationType,
    "cDate": dateTimeType,
    "cBy": String, //username
    "layer":[heblayerType],
    "status":String
});*/



var annotatedSentenceType = new Schema({
    "ID":ObjectId,// in the sentenceType - there is annotations list - referring to this ID  TODO change to _id?
    "validVersion" : Boolean,
    "status": String,
    "cDate": dateTimeType,
    "cBy": String, //username
    "sentenceId" : ObjectId, //the id of the sentence in the sentences collection
    //"sentenceContent": ConllJson31Type, //only the relevant one - the one which this annotation is being made on (the valid one!)
    //"segmentationID" : ObjectId, //each sentence has one or more versions - according to the original imported sentence and its corrections, only one of those will be valid
    //in case that this version is not valid  - all the annotation set will be marked as not valid
    "layer":[heblayerType]
},{strict: false});


/**
 * "description":"this is a N-2-N relationshop table between LU and sentences - will contain all the annotations which are related to the pair",
 * a lu with sentence will be added to this list when a lu-sentence association is being created
 * @type {Schema}
 */
var luSentenceSchema = exports.luSentenceSchema = new Schema({
    "sentenceID" : ObjectId,
    "luId": String, //the id of the annotated lexical unit.
    "luName": String, //optimization
    "frameID": IDType, //the id of the frame which this lu is related to  (search and data retrieval optimization)
    "frameName": String,
    "annotations": [annotatedSentenceType],
    "comments": [commentType],
    "text": String,
    cDate: Date,
    cBy: String
},{strict: false});




var inquiryType = new Schema({
    "ID": ObjectId,
    "cDate":dateTimeType,
    "cBy":String,
    "status": {type: String, enum:['answered','pending']},
    "text":String,
    "subInquireies":[inquiryType],
    "forumLink": String
});

var decisionSchema = exports.decisionSchema = new Schema({
    cDate:dateTimeType,
    cBy: String,
    reviewer: String,
    frameId: IDType,
    lexUnitID: ObjectId,
    "type":{"type":String, enum : ["frameLu","frame-lu","lu-sentence","sentence-annotation"]},
    "content":Object,//the decision object
    "decisionExplanation":"String",
    "status":{type:String, enum: ["approved", "seen","unseen","rejected", "inquiry" ]},
    "hasInquiries":Boolean,
    "inquiryContent":[inquiryType]

},{_id:false, strict : false});

decisionSchema.tooltip={aa:"aaaaa"};

console.log("DEBUG: creating hebrew models - << models/schemes/hebrew >>");
exports.hebFrameModel = mongoose.model(coll.hebframes, hebFrameSchema, coll.hebframes );
exports.hebSentenceModel = mongoose.model(coll.hebSent, hebsentenceSchema, coll.hebSent);
exports.hebBadSentenceModel = mongoose.model(coll.hebBadSent, hebsentenceSchema, coll.hebBadSent);
//exports.hebBadSentenceModel = mongoose.model(badSentencesCollectionName, new Schema({}, {strict: false}), badSentencesCollectionName);
exports.luSentenceModel = mongoose.model(coll.hebLuSent, luSentenceSchema, coll.hebLuSent);
exports.annotatorDecisionsModel = mongoose.model(coll.hebDecisions, decisionSchema, coll.hebDecisions);
exports.historyModel = mongoose.model(coll.history, historySchema,coll.history);




