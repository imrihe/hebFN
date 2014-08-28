
printModule('tools/population');
var heblexUnit =exports.hebLUexample = {
    "priority": 0,
    "definition": "this is the definitiion of the lexical unit",
    "status": "approved", //{type:String,enum: ["approved","pending"]},
    "translatedFrom"://"description":"holds information regarding the english lexical unit which this lexical unit was translated from",
    {
        "frameId":7,
        "lexUnitName":"move.v",
        "lexUnitID" : 6
    },
//"description":"contains information regarding the sentences of this lexical unit",

    "sentenceCount":{
        "total":1,
        "annotated":0
    },
    "lexeme":[{ "name": "התקדם",
                "POS":"V",
                "breakBefore":false,
                "headword":false,
                "order":0}],
    //"semType":[], //{ "@name":String,"@ID": IDType}
    "valences": {
        "governor": "[governorType]",
        "FERealization":"[FERealizationType]",
        "FEGroupRealization":"[FEGroupRealizationType]"
    },
    //"annotations":[60001001],//[IDType],
    //"@ID":60001,
    "@name":"התקדם.v", //{type:String, match: /^.+\..+/},
    "@POS":"V", //hebPOSType,
    //"@incorporatedFE": String,
    "@status":"GOOD",//{type: String, match: /^[A-Z].*/},
    //"@cDate": new Date(),//dateTimeType,
    //"@cBy":"imri" //String,
    "@lemmaID":1234 //TODO: remove?
};


