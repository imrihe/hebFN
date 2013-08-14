/**
 * data schemes
 * the idea is: each dataType in the DB will have it's own scheme.
 *              additionally - every scheme defines scheme unique methods (such as getters and setters) when needed - those methodes will be exposed to each object of the scheme
 *              in order to save\insert new document into the DB - we will firest define suitable model (by scheme) and then call the NEW operator with the document data.
 *              in order to query the DB - we will do modelName.find() \findOne() etc. - the result will be returned to the calledBack function sent
 */

console.log("DEBUG: loading schemes@");
var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
//var Number = Schema.Types.Number;
//var Date = Schema.Types.Date;
var roleType = new Schema({role: {type: String, enum:["annotator", "reviewer","planner","admin"]}});

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



var IDType =exports.IDType={ type: Number, min: 0 } ; //TODO new schema
var orderType =  { type: Number, min: 0 }; //"description": "a numeric type to use for order specification (rank, paragraph order, etc.)",
var frameNameType = {type :String, match: /^[A-Z].*/}; //TODO: check correctness of regex
var dateTimeType = String;//{ type: Date, default: Date.now } ;
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

var layerType = new Schema({
    "label": [labelType],
    "@name": String,
    "@rank": orderType
});


var subCorpusType = new Schema({
    "sentence": [sentenceType]
});


var extSentRefType = {type: Number, min: 0}; //			"description": "a numeric type to use for external references to sentences (aPos)",
var annotationSetType = exports.annotationSetType = new Schema({
    "@ID6": IDType,
    "@status": String,
    "@frameName": String,
    "@frameID": IDType,
    "@luName": String,
    "@luID":IDType,
    "@cxnName": String,
    "@cxnID": IDType,
    "@cDate": dateTimeType,
    "layer": [layerType]
});
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

var sentenceType = new Schema({
    "text": String,
    "annotationSet": [annotationSetType],
    "@ID": IDType,
    "@aPos": extSentRefType,
    "@paragNo": orderType,
    "@sentNo": orderType,
    "@docId": IDType,
    "@corpID": IDType



});


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
var semTypeRefType = new Schema({
    "@name":String,
    "@ID": IDType
});

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
    "definition": String,
    "semType": [semTypeRefType],
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
var relatedFramesType = new Schema({
    "@type": String, //TODO: check if there are enums for this field
    "relatedFrame" : [{"$": frameNameType}]
});
var lexemeType=  exports.lexemeType = new Schema({
    //description" :"an attributes-only lexeme element",
    "@name": String,
    "@POS": POSType,
    "@breakBefore": Boolean,
    "@headword": Boolean,
    "@order": orderType
})  ;



var frameLUType = exports.frameLUType= new Schema({

    //"description" : "frame-embedded lexUnit type",
        "definition": defType, //"comment": "has SOURCE then a colon followed by a string"
        "sentenceCount": {total: countType, annotated: countType},
        "lexeme": [lexemeType],
        "semType":[semTypeRefType],
        "@cDate": dateTimeType,
        "@cBy": String,
        "@lemmaID": IDType,
        "@ID": IDType,
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
        "definition": defType,
        "@cDate": dateTimeType,
        "@cBy": String,
        "@lemmaID": IDType,
        "@POS": POSType,
        "@frameID":IDType,
        "@frame": frameNameType,
        "header":headerType,
        "sentenceCount": {total: countType, annotated: countType},
        "lexeme": [lexemeType],
        "semType":[semTypeRefType],
        "valences": valencesType,
        "subCorpus": [subCorpusType],
        "@incorporatedFE": String,
        "totalAnnotated":countType
    }
});



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
        "semType":[semTypeRefType], //same type as english
        "FE": [FEType] ,
        "FEcoreSet": [memberFEtype], //occurrences: 0+
        "frameRelation": [relatedFramesType],
        "lexUnit": [hebFrameLUType]
});



var hebFrameLUType = exports.hebFrameLUType = new Schema({
"frameLUType":{
    "description":"frame-embedded lexUnit type",
        "type":"object",
        "properties":{
        "priority": "Number"
        "definition":"defType"
        "status":{
            "type":"String",
                "oneOf":[
                {
                    "format":"approved"
                },
                {
                    "format":"pending"
                }
            ]
        },
        "translatedFrom":{
            "description":"holds information regarding the english lexical unit which this lexical unit was translated from",
                "type":"object",
                "properties":{
                "luId":"IDType",
                    "lexUnit":"string"
            },
            "required":[
                "luId",
                "lexUnit"
            ]
        },
        "sentenceCount":{
            "description":"contains information regarding the sentences of this lexical unit",
                "type":"object",
                "properties":{
                "total":"countType",
                    "annotated":"countType"
            },
            "required":[
                "total",
                "annotated"
            ]
        },
        "lexeme":{
            "type":"array",
                "items":{
                "lexeme":"lexemeType"
            },
            "minimum":1
        },
        "semType":{
            "type":"array",
                "items":{
                "semType":"semTypeRefType"
            }
        },
        "valences":"valencesType",
            "anottations":{
            "type":"array",
                "items":{
                "id":"IDType"
            },
            "attributeGroup":[
                "basicLUAttributes"
            ],
                "cDate":"dateTimeType",
                "cBy":"string",
                "lemmaID":"IDType"
        },
        "required":[
            "cDate",
            "cBy",
            "lemmaID"
        ]
    }}

});