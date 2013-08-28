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

printModule('models/schemes/hebrew');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.model;
var ObjectId = mongoose.Schema.Types.ObjectId;
//var Number = Schema.Types.Number;
//var Date = Schema.Types.Date;
var roleType = {type: String, enum:["annotator", "reviewer","planner","admin"]};

var userSchema = exports.userSchema = new Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    roles: [roleType]
//	roles: Array
});

userSchema.methods.validPassword = function (password) {
	console.log("validating user in : userScheme");
	  if (password === this.password) {
	    return true; 
	  } else {
	    return false;
	  }
};

/**
 * english frame schema ande related subSchemes
 */



var IDType = exports.IDType ={ type: Number, min: 0 } ; //TODO new schema
var orderType =  { type: Number, min: 0 }; //"description": "a numeric type to use for order specification (rank, paragraph order, etc.)",
var frameNameType = {type :String, match: /^[A-Z].*/}; //TODO: check correctness of regex
var dateTimeType = { required: true , type: Date, auto : true}; //match:  "\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2} [A-Z]{3} (Sun|Mon|Tue|Wed|Thu|Fri|Sat)"
var countType = { type: Number, min: 0 }; //"description": "a numeric type to use for pattern counts",
var POSType = {type: String, enum:  [ "N","V", "A", "ADV","PRON","PREP","NUM","C","INTJ","ART","SCON","CCON","AVP"]};
var defType = String;
//console.log(IDType);

var RGBColorType = {type: String, match: /^[0-9A-Fa-f]{6}/};
var coreType = {type: String, enum:["Core","Peripheral","Extra-Thematic","Core-Unexpressed"]};


//var labelSpanType = new Schema({type: Number, min:0});//"description" : "a numeric type to use for Label spans",
var labelSpanType = {type: Number, min:0};//"description" : "a numeric type to use for Label spans",
var labelType = new Schema({
    "@name": String,
    "@start": labelSpanType,
    "@end": labelSpanType,
    "@fgColor": RGBColorType,
    "@bgColor": RGBColorType,
    "@itype": {type: "string",enum: ["APos","CNI","INI","DNI","INC"]},
    "@feID": Number,
    "@cBy": String
});

var layerType ={
    "label": [labelType],
    "@name": String,
    "@rank": orderType
};


var subCorpusType = {
    "sentence": [sentenceType]
};


var extSentRefType = {type: Number, min: 0}; //			"description": "a numeric type to use for external references to sentences (aPos)",
var annotationSetType ={
    "@ID": IDType,
    "@status": String,
    "@frameName": String,
    "@frameID": IDType,
    "@luName": String,
    "@luID":IDType,
    "@cxnName": String,
    "@cxnID": IDType,
    "@cDate": dateTimeType,
    "layer": [layerType]
};
var annoSetType = {"@ID" : IDType};
var governorType = new Schema({
    "annoSet": [annoSetType],
    "@lemma": String,
    "@type": String   //TODO: check for enum
});

var FEValenceType = {"@name":String};
 var valenceUnitType = {
                 "FE": String,
                 "PT": String,
                 "GF":String
 };
var FERealizationType  =new Schema({
    "FE": FEValenceType,
    "pattern":[{"@total": countType, "valenceUnit": valenceUnitType , "annoSet": [annoSetType]}],
    "@total": countType
});



var FEGroupRealizationType = new Schema({
            "FE": [FEValenceType],
            "pattern":[{"@total": countType, "valenceUnit": [valenceUnitType] , "annoSet": [annoSetType]}],
            "@total": countType
});



var valencesType = {
            "governor": [governorType],
            "FERealization":[FERealizationType],
            "FEGroupRealization":[FEGroupRealizationType]
};

var sentenceType = {
    "text": String,
    "annotationSet": [annotationSetType],
    "@ID": IDType,
    "@aPos": extSentRefType,
    "@paragNo": orderType,
    "@sentNo": orderType,
    "@docId": IDType,
    "@corpID": IDType



};


var documentType = new Schema({"@ID":IDType, "@description": String});
var corpDocType = new Schema({
    "@name": String,
    "@ID":IDType,
    "document": [documentType]
});

var headerType = {
    "corpus": [corpDocType],
    "frame":{
        "FE":[new Schema({
            "@fgColor" : RGBColorType,
            "@bgColor" :RGBColorType,
            "@type" : coreType,
            "@abbrev" : String,
            "@name" : String
        })]
    }
};


//description": "a string type for FE core types",


/**semTypeRefType
 * same for english and hebrew
 */
var semTypeRefType = {
    "@name":String,
    "@ID": IDType
};

/**
 * same in hebrew
 * @type {Schema}
 */
var internalFrameRelationFEType = exports.internalFrameRElationFEType= new Schema({
    "@name": String,
    "@ID": {type: Number,min :0 }
});

/** FEType
 * same in hebrew
 * @type {Schema}
 */
var FEType = exports.FEType = new Schema({
    //"definition": String,
    //"semType": {type:[semTypeRefType], select: false},     //TODO - remove the select field
    "requiresFE": [internalFrameRelationFEType],
    "excludesFE": [internalFrameRelationFEType],
    "@ID": IDType,
    "@name": frameNameType,
    "@abbrev": String,
    "@cDate": dateTimeType,
    "@cBy": String,
    "@coreType": coreType,
    "@fgColor": RGBColorType,
    "@bgColor": RGBColorType
});

/**relatedFramesType
 * same in hebrew
 */
var relatedFramesType = {
    "@type": String, //TODO: check if there are enums for this field
    "relatedFrame" : [frameNameType]
};
var lexemeType=  exports.lexemeType = {
    //description" :"an attributes-only lexeme element",
    "@name": String,
    "@POS": POSType,
    "@breakBefore": Boolean,
    "@headword": Boolean,
    "@order": orderType
};



var frameLUType = exports.frameLUType= new Schema({

    //"description" : "frame-embedded lexUnit type",
        "definition": defType, //"comment": "has SOURCE then a colon followed by a string"
        "sentenceCount": {total: countType, annotated: countType},
        "lexeme": [lexemeType],
        "semType":[semTypeRefType],
        "@cDate": dateTimeType,
        "@cBy": String,
        "@lemmaID": IDType,
        "@ID": IDType,//IDType
        "@name": {type : String, match: /^.+../}, //TODO: check correctness of regex
        "@POS": POSType,
        "@incorporatedFE": String,
        "@status": {type: String, match: /^[A-Z].*/} //TODO: check correctness of regex
});

/**memberFEtype
 * same in hebrew
 * @type {Schema}
 */
var memberFEtype   = exports.memberFEtype = new Schema({
                    "memberFE": [internalFrameRelationFEType]} //occurrences: 2+
                    );

var engFrameSchema = exports.engFrameSchema = new Schema(
    {"frame": {
        "_id" : ObjectId,
        "definition": defType,
        "semType": [semTypeRefType],
        "FE": [FEType] ,
        "FEcoreSet": [memberFEtype], //occurrences: 0+
        "frameRelation": [relatedFramesType],
        "lexUnit": [frameLUType],
        "@ID": IDType,
        "@name": frameNameType,
        "@cDate": dateTimeType,
        "@cBy": String
    }
});


/**
 * hebrew frame schema
 */




/**
 * english LU schema
 */
var lexUnit = exports.lexUnit = new Schema({
    "lexUnit":{
        "@ID": IDType,
        "@name": {type : String, match: /^.+../}, //TODO: check correctness of regex
        "@status": {type: String, match: /^[A-Z].*/}, //TODO: check correctness of regex
        "definition": defType, //TODO: correct the $ key in the DB
        "header":headerType,
        "@cDate": dateTimeType,
        "@cBy": String,
        "@lemmaID": IDType,
        "@POS": POSType,
        "@frameID":IDType,
        "@frame": frameNameType,

        "sentenceCount": {total: countType, annotated: countType},
        "lexeme": [lexemeType],
        "semType":[semTypeRefType],
        "valences": valencesType,
        "subCorpus": [subCorpusType],
        "@incorporatedFE": String,
        "totalAnnotated":countType
    }
});


/*********************** hebrew schemes:*******************************/
//missing: history, annotatorDecisions,inquiryType



/**
 * general types
 *
 */
var hebPOSType = {required: true, type: String, enum:  [ "N","V", "A", "ADV","PRON","PREP","NUM","C","INTJ","ART","SCON","CCON","AVP"]};


/**
 * hebrew LU schema
 */



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



/**  hebFrameLUType
 *"description":"frame-embedded lexUnit type",
 * @type {Schema}
 * each lu will have an _id - the _id will be it's identifier in the entire database. and is of type ObjectID
 */
var hebFrameLUType = exports.hebFrameLUType = new Schema({
    //"_id": ObjectId,
    "priority": Number,
    "definition": defType,
    "status":{type:String,enum: ["approved","pending"]},
    "translatedFrom"://"description":"holds information regarding the english lexical unit which this lexical unit was translated from",
    {
        "frameId":IDType,
        "lexUnitName":String,
        "lexUnitID" :IDType
    },
    //"description":"contains information regarding the sentences of this lexical unit",

    "sentenceCount":{
        "total":countType,
        "annotated":countType
    },
    "lexeme":[heblexemeType],
    "semType":{type : [semTypeRefType], required: false},
    "valences": valencesType,
    "annotations":[IDType],
    //"@ID":ObjectId,//{type: Number ,unique: true, auto: true},
    "@name":{required: true, type: String, match: /^.+\..+/},
    "@POS": hebPOSType,
    "@lemmaID":IDType,
    "@incorporatedFE":String,
    "@status":{type: String, match: /^[A-Z].*/},
    "@cDate": dateTimeType,
    "@cBy":String
}); //{_id: false}


/**
 * hebrew frame schema
 * "description":"Contains information about the frame: definition, priority,semantic type, frame elements, core frame element, frame relations, and lexical units; does not contain annotations.",
 */


/**
 *
 * @type {Schema}
 */
var hebFrameType = exports.hebFrameType = new Schema({
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
        "lexUnit": [hebFrameLUType]
});

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
});



//var frameModel = mongoose.model('Frame', frame, 'frame');
var frameModel = mongoose.model('hebFrames', hebFrameType, 'hebFrames');
//console.log(typeof(values(frameModel.schema.paths.lexUnit.schema.tree)[2]));
//console.log(values(hebFrameLUType.tree));
//console.log(hebFrameType)
//console.log(keys(hebFrameLUType.paths))
//console.log("values",values(hebFrameLUType))


/**
 * this is how the word (in a snetnece)is represented according to alon's search engine,
 * TODO: add description to each one of the fields
 * @type {Schema}
 */
var wordType = new Schema({
    "word": String,
    "prefix": String,
    "base": String,
    "suffix": String,
    "lemma": String,
    "pos": String,
    "postype": String,
    "gender":{type : String, enum: ['m', 'f']},
    "number":{type: String, enum: ['s','p','_']},// "comment" : "singular/plural or non. check if plural is signaled by p!",
    "construct": String,
    "polarity": {type: String}, //  "comment" : "probably contains: (pos) | (neg) | _"
    "person":{type: String, enum: ['1','2','3']},
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
    "sufperson":{type: String, enum:['1','2','3']},
    "chunk": String,
    "height": Number,
    "id": Number,
    "parid": Number,
    "pardist": Number,
    "parpos": String,
    "parword": String
});



//ConllJson31Type
/**TODO: complete this according to alon's type - 31 json response
 *comment : "the json as received by alon's search tool",
 * @type {Schema}
 */
var ConllJson31Type = new Schema({
    "length" : Number,
    "height" :Number,
    "root_location" :Number,
    "root_pos" : String,
    "pattern" :  String,
    "words" :[wordType],
    "valid": Boolean,
    "original": Boolean
});


/**
 *"description":"sentence will contaion the basic POS, parse trees and morphology along with list of annotationSet ids",
 * @type {Schema}
 */
var hebsentenceType = exports.hebsentenceType = new Schema({
    "text":String,
    "Content" : [ConllJson31Type], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
    "lus":[IDType],//save the related LU ids
    "ID":IDType,
    "source": {type: String, enum: ["corpus", "manual", "translation"]},
    //"comment":"sentences can also be manually inserted",
    "sentenceOrigin": {
        "aPos":extSentRefType,
        "paragNo":orderType,
        "sentNo":orderType,
        "docId":IDType,
        "corpID":IDType
    }
});


var heblabelType = new Schema({
    "name":String,
    "tokens":[Number],//"comment" : "contains the index of the words found in the relevant sentence",
    "fgColor":RGBColorType,
    "bgColor":RGBColorType,
    // "comment":"for null instantiation",
    "itype":{type: String, enum: ["APos","CNI","INI","DNI","INC"]},
    "feID":IDType //contatins the relevant FE if this is part of FN annotation layer
});

/**each layer will have it's own type (name) - dependency, FN annotations, constituency etc
 *
 * @type {Schema}
 */
var heblayerType = new Schema({
            "label":[heblabelType],
            "name":String,
            "rank":orderType,
            "status":{type: String, enum: ["approved","decision","inquiry","temporary"]}
});


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
    "ID":IDType,//is it needed??? in the sentenceType - there is annotations list
    "validVersion" : Boolean,
    "status": String,
    "cDate": dateTimeType,
    "cBy": String, //username
    "sentenceId" : IDType, //the id of the sentence in the sentences collection
    //"sentenceContent": ConllJson31Type, //only the relevant one - the one which this annotation is being made on (the valid one!)
    "versionNumber" :Number, //each sentence has one or more versions - according to the original imported sentence and its corrections, only one of those will be valid
    //in case that this version is not valid  - all the annotation set will be marked as not valid
    "layer":[heblayerType]
});


/**
 * "description":"this is a N-2-N relationshop table between LU and sentences - will contain all the annotations which are related to the pair",
 * a lu with sentence will be added to this list when a lu-sentence association is being created
 * @type {Schema}
 */
var luSentenceType = exports.luSentenceType = new Schema({
    "luId": IDType, //the id of the annotated lexical unit.
    "luName": String, //optimization
    "frameID": IDType, //the id of the frame which this lu is related to  (search and data retrieval optimization)
    "annotations": [annotatedSentenceType]
});

/******************************* translations schema *********************/


//posTransType = [String];
var translationType =  {'pos' : String, 'vals' : [String]};

var translation = exports.translation = new Schema({
    "luID": IDType, //the id of  lexical unit.
    "frameID": IDType, //the id of the frame.
    "pos": String, //part of speech of the lu
    "name": String, //the 'name' it self (the actual form)
    "translation": [translationType]
});

