/**
 */
printModule('models/schemes/sentencesSchema');

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
    dateTimeType = types.dateTimeType

var extSentRefType =types.extSentRefType;// {type: Number, min: 0}; //			"description": "a numeric type to use for external references to sentences (aPos)",

var hebrewSchema = require('./hebrew.js')
var commentType =hebrewSchema.commentType;

/**
 * general types
 *
 */
var hebPOSType = {required: true, type: String, enum:  [ "N","V", "A", "ADV","PRON","PREP","NUM","C","INTJ","ART","SCON","CCON","AVP"]};


/**
 * this is how the word (in a snetnece)is represented according to alon's search engine,
 * TODO: add description to each one of the fields
 * @type {Schema}
 */
var itayWordType = new Schema({


    //FN added fields:
    special:    {type: Boolean},
    specTrans:  {type: String},


    id	:Number,    //Token counter, starting at 1 for each new sentence   //TODO: changed from ID
    index: Number,  //Token counter, starting at 0 for each new sentence
    word: String,   //Word textual form or punctuation symbol
    lemma: String,  //Lemma or stem (depending on particular data set) of word form, or an underscore if not available.
    cpos: String,   //Coarse-grained part-of-speech tag //TODO: enum
    pos: String,    //Fine-grained part-of-speech tag. Identical to the coarse-grained part-of-speech tag if not available. //TODO: enum
    parid: Number,  //parent of the current token, which is either the value of the parent's id or zero ('0'). TODO: changed from head
    phead: String, 	//Projective head of current token, which is either a value of id or zero ('0'), or an underscore if not available.
    pdeprel: String, //Dependency relation to the phead, or an underscore if not available.
    deprel: String, //Dependency relation to the parent of this token.
    height: Number, //Height of this token in the dependency tree
    parpos: String, //Part-of-speech of this token's parent //TODO: enum
    parword: String, //Word value for this token's parent
    gender: String, //Gender of this token, if available //TODO: enum
    polar: String,  //Polarity of this token, if available //TODO: enum
    number: String, //Grammatical number of this token, if available TODO: enum
    person: String, //Grammatical person of this token, if available //TODO: enum
    binyan: String, //Binyan of this token, if available TODO: enum
    tense: String, //Tense of this token, if available TODO: enum
    type: String //Pronoun type of this token, if available TODO: enum

    //FEATS:
    /*number:     {type: String}, //TODO add enum: ['sp','s','p','d','dp','_']},// "comment" : "singular/plural or non. check if plural is signaled by p!",
     person:     {type: String, enum: ['1','2','3', '', '_']}, //V
     polar:      {type: String}, //TODO: itay needs to add this!!, TODO: add enum: ['pos','neg']
     tense:      {type: String}, //V
     type:       {type: String}, //TODO: check with itay what does it means? part of FEATS
     binyan:     {type: String}, //TODO: add enum: ['PAAL','NIFAL','HIFIL','HUFAL','PIEL','PUAL','HITPAEL', '_']
     gender:     {type: String}, //TODO: add enum - check with itay: enum: ['_','m', 'f', 'mf']
     */
    //calculated fields
});

var wordType_OLD2 = new Schema({

    //basic morphological data:
    "cpos" : String,
    "pos": String, //TODO - enum
    "prefix": String, // TODO: removed ??
    "base": String,  // TODO: removed
    "suffix": String,//TODO: removed
    //FEATS
    "gender":{type : String, enum: ['_','m', 'f', 'mf']}, //
    "number":{type: String, enum: ['sp','s','p','d','dp','_']},// "comment" : "singular/plural or non. check if plural is signaled by p!",
    "construct": String, //TODO - missing - what the fuck is this? check with micahel, something from michael, couldn't reproduce
    "polarity": {type: String}, //  "comment" : "probably contains: (pos) | (neg) | _"    //TODO - missing
    "person":{type: String},//, enum: ['1','2','3']},
    "tense": String,        //V
    "def": Boolean, //TODO: removed??
    "binyan" : {type: String, enum: ['PAAL','NIFAL','HIFIL','HUFAL','PIEL','PUAL','HITPAEL', '_']},
    "otherFeats" : String,
    //FEATS-end

    //dependency related data:
    "deprel": String, //TODO - enum
    "head" : String,  //Number
    "Phead" : String, //Number
    "pdeprel": String, //TODO - enum


    //extra calculated fields:
    "height": Number,  //V
    "id": Number,    //Token counter, starting at 1 for each new sentence
    "pardist": Number,
    "parpos": String, //V
    "parword": String, //v
    "special": Boolean,   //
    "specTrans" : String,

    //new itay fields - 27/3
    index: Number, //Token counter, starting at 0 for each new sentence
    word: String, //Word textual form or punctuation symbol
    lemma: String, //Lemma or stem (depending on particular data set) of word form, or an underscore if not available.
    parid: Number //parent of the current token, which is either the value of the parent's id or zero ('0').


},{strict: false});
var wordType_OLD = new Schema({

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


//TODO: remove 'sentenceProperties' from views and tools.js (createConllJson or something similar)
var itaySentenceSchema = new Schema({
    ID: ObjectId,
    sentence: {
        genre:                  {type: String}, //new
        height:                 {type: Number}, //V
        length:                 {type: Number}, //V
        pattern:                {type: String}, //new
        root_location:          {type: Number}, //V
        root_pos:               {type: String}, //V
        text:                   {type: String},  //V
        tokenized_text:         {type: String}, //new
        words:                  [itayWordType], //CHANGED
        dep_parse_source:       {type: String}, //new
        const_parse_contents:   {type: String}, //new
        const_parse_format:     {type: String}, //new
        const_parse_method:     {type: String}, //new
        const_parse_source:     {type: String}, //new
        //
        esId: String, //id in elastic search
        doc_name: String,
        doc_position: String,
        dep_parser_url: String,
        const_parser_url: String,
        const_parse_content: String,
        //words: itayWordType,
        //frameNet added fields:
        valid:                  {type: String} //FN param
    }
});



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
    "words" :[wordType_OLD],
    "valid": Boolean,
    "text": String
    //"original": Boolean
},{_id:false});


//var ConllJson31Type = require('sentenceSchema.js').sentenceSchema;

/**
 *"description":"sentence will contaion the basic POS, parse trees and morphology along with list of annotationSet ids",
 * @type {Schema}
 */
var hebsentenceSchema = new Schema({
    "text":String,
    //"content" : [ConllJson31Type], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
    "content" : [itaySentenceSchema], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
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
},{strict:true});

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
    "annotations": [hebrewSchema.annotatedSentenceType],
    "comments": [hebrewSchema.commentType],
    "text": String,
    cDate: Date,
    cBy: String
},{strict: false});

//exports.hebFrameModel = mongoose.model(coll.hebframes, hebFrameSchema, coll.hebframes );
exports.hebSentenceModel = mongoose.model(coll.hebSent, hebsentenceSchema, coll.hebSent);
exports.hebBadSentenceModel = mongoose.model(coll.hebBadSent, itaySentenceSchema, coll.hebBadSent);




