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
printModule('models/schemes/english');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.model;
var ObjectId = mongoose.Schema.Types.ObjectId;
//var Number = Schema.Types.Number;
//var Date = Schema.Types.Date;
var roleType = {type: String, enum:["annotator", "reviewer","planner","admin"]};

var frameCollection = 'frame',
    luCollection = 'lu',
    translationsCollection = 'translationsV3';

/*var userSchema = exports.userSchema = new Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    roles: [roleType]
//	roles: Array
});*/

/*userSchema.methods.validPassword = function (password) {
	console.log("validating user in : userScheme");
	  if (password === this.password) {
	    return true; 
	  } else {
	    return false;
	  }
};*/

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
var lexUnitSchema = exports.lexUnit = new Schema({
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
/**************************************************************************/


/******************************* translations schema *********************/


//posTransType = [String];
var translationType =  {'pos' : String, 'vals' : [String]};

var translationSchema = exports.translationSchema = new Schema({
    "luID": IDType, //the id of  lexical unit.
    "frameID": IDType, //the id of the frame.
    "pos": String, //part of speech of the lu
    "name": String, //the 'name' it self (the actual form)
    "translation": [translationType]
});
/**************************************************************************/


/******************************* models export *****************************/

console.log("DEBUG: creating english models - << models/schemes/english >>");
exports.frameModel =        mongoose.model(frameCollection, engFrameSchema, frameCollection) ;
exports.luModel  =          mongoose.model(luCollection, lexUnitSchema, luCollection) ;
exports.translationModel  = mongoose.model(translationsCollection, translationSchema, translationsCollection) ;

/***********************************************************************/

