/**
 * general schema types - for use by all schemes
 * User: imrihe
 * Date: 9/1/13
 * Time: 4:23 PM
 * To change this template use File | Settings | File Templates.
 */
printModule("models/schemes/generalTypes");
var Schema = require('mongoose').Schema;
var basicTypes = module.exports  = {
 ObjectId : require('mongoose').Schema.Types.ObjectId,
 IDType : { type: Number, min: 0 } , //TODO new schema
 orderType :  { type: Number, min: 0 }, //"description": "a numeric type to use for order specification (rank, paragraph order, etc.)",
 frameNameType : {type :String, match: /^[A-Z].*/}, //TODO: check correctness of regex
 dateTimeType : { required: true , type: Date, auto : true}, //match:  "\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2} [A-Z]{3} (Sun|Mon|Tue|Wed|Thu|Fri|Sat)"
 countType : { type: Number, min: 0 }, //"description": "a numeric type to use for pattern counts",
 POSType : {type: String, enum:  [ "N","V", "A", "ADV","PRON","PREP","NUM","C","INTJ","ART","SCON","CCON","AVP"]},
 defType : String,
//console.log(IDType);

 RGBColorType : {type: String, match: /^[0-9A-Fa-f]{6}/},
 coreType : {type: String, enum:["Core","Peripheral","Extra-Thematic","Core-Unexpressed"]}

};
/**semTypeRefType
 * same for english and hebrew
 */
//var semTypeRefType=module.exports.semTypeRefType = String;
var semTypeRefType =module.exports.semTypeRefType = new Schema({ //TODO:SCHEMA
    "@name":String,
    "@ID": basicTypes.IDType
},{_id:false});

//console.log("SSSSSSSS;",semTypeRefType)
/**
 * same in hebrew
 * @type {Schema}
 */
var internalFrameRelationFEType  =module.exports.internalFrameRelationFEType = new Schema({
    "@name": String,
    "@ID": {type: Number,min :0 }
});



var FEType =module.exports.FEType=   new Schema({
    "definition": String,
    "semType": {type: [semTypeRefType], select: true},     //TODO - remove the select field
    "requiresFE": [internalFrameRelationFEType],
    "excludesFE": [internalFrameRelationFEType],
    "@ID": basicTypes.IDType,
    "@name": basicTypes.frameNameType,
    "@abbrev": String,
    "@cDate": basicTypes.dateTimeType,
    "@cBy": String,
    "@coreType": basicTypes.coreType,
    "@fgColor": basicTypes.RGBColorType,
    "@bgColor": basicTypes.RGBColorType
},{_id:false});


/**relatedFramesType
 * same in hebrew
 */
var relatedFramesType = module.exports.relatedFramesType = new Schema({
    "@type": String, //TODO: check if there are enums for this field
    "relatedFrame" : [basicTypes.frameNameType]
},{_id:false});


/**memberFEtype
 * same in hebrew
 * @type {Schema}
 */
var memberFEtype   =module.exports.memberFEtype  = new Schema(
    {
        "memberFE": [internalFrameRelationFEType]
    },{_id:false} //occurrences: 2+
);


var extSentRefType =module.exports.extSentRefType=  {type: Number, min: 0}; //			"description": "a numeric type to use for external references to sentences (aPos)",
var annoSetType =  module.exports.annoSetType=  {"@ID" : basicTypes.IDType};


var FEValenceType =module.exports.FEValenceType= {"@name":String};

var governorType = module.exports.governorType=  new Schema({
    "annoSet": [annoSetType],
    "@lemma": String,
    "@type": String   //TODO: check for enum
});

var valenceUnitType = module.exports.valenceUnitType= {
    "FE": String,
    "PT": String,
    "GF":String
};
var FERealizationType  =module.exports.FERealizationType= new Schema({
    "FE": FEValenceType,
    "pattern":[{"@total": basicTypes.countType, "valenceUnit": valenceUnitType , "annoSet": [annoSetType]}],
    "@total": basicTypes.countType
});



var FEGroupRealizationType = module.exports.FEGroupRealizationType=  new Schema({
    "FE": [FEValenceType],
    "pattern":[{"@total": basicTypes.countType, "valenceUnit": [valenceUnitType] , "annoSet": [annoSetType]}],
    "@total": basicTypes.countType
});



var valencesType = module.exports.valencesType ={
    "governor": [governorType],
    "FERealization":[FERealizationType],
    "FEGroupRealization":[FEGroupRealizationType]
};




