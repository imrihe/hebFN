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
var ObjectId =types.ObjectId;


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
});



var itaySentenceSchema = new Schema({
    cDate: {type: Date, default: new Date()},
    valid:                  {type: String}, //FN param
    fullSentence: {
        words:                  [itayWordType], //CHANGED
        esId: String, //id in elastic search
        genre:                  {type: String}, //new
        height:                 {type: Number}, //V
        length:                 {type: Number}, //V
        pattern:                {type: String}, //new
        root_location:          {type: Number}, //V
        root_pos:               {type: String}, //V
        text:                   {type: String},  //V
        tokenized_text:         {type: String}, //new
        dep_parse_source:       {type: String}, //new
        const_parse_contents:   {type: String}, //new
        const_parse_format:     {type: String}, //new
        const_parse_method:     {type: String}, //new
        const_parse_source:     {type: String}, //new
        doc_name: String,
        doc_position: String,
        dep_parser_url: String,
        const_parser_url: String,
        general: String
    }
});



/**
 *"description":"sentence will contaion the basic POS, parse trees and morphology along with list of annotationSet ids",
 * @type {Schema}
 */
var hebsentenceSchema = new Schema({
    cDate: {type: Date, default: new Date()},
    "text":String,
    "content" : [itaySentenceSchema], //array with possible segmentations of the sentence, only one will be marked as 'original' and one as 'valid'
    "lus":[String],//save the related LU ids framename_luname
    "ID":ObjectId,
    "source": {type: String, enum: ["corpus", "manual", "translation"]}//TODO: WTF?
},{strict:true});



//exports.hebFrameModel = mongoose.model(coll.hebframes, hebFrameSchema, coll.hebframes );
exports.hebSentenceModel = mongoose.model(coll.hebSent, hebsentenceSchema, coll.hebSent);
exports.hebBadSentenceModel = mongoose.model(coll.hebBadSent, hebsentenceSchema, coll.hebBadSent);




