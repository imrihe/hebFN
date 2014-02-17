var sc = require('./hebrew.js');
var eng = require('./english.js');
var heb = require('./hebrew.js');
var general = require('./generalTypes.js');

var mongoose = require('mongoose');
var Model = require('mongoose').model;
console.log('\n********tests***********\n');
var Schema = mongoose.Schema;

//console.log(JSON.stringify(sc.hebFrameType.paths));
var ds =sc.annotatorDecisionsModel;
//console.log(ds.schema.tooltip)

var pp =sc.hebFrameLUSchema.paths;
//console.log(sc.hebFrameType.paths.lexUnit.schema)


    //console.log("INSTANCES")
    //for (obj in instances) //console.log(instances[obj]['path'], instances[obj]['instance'])
    //console.log("\nOTHERS")
    //for (obj in others) //console.log(others[obj])
    //console.log("\nSCEHMES")
    //for (obj in schemes) {
        //console.log(schemes[obj]['path']+'\n\t'+JSON.stringify(schemes[obj]['schema']['paths']))

//printPaths(pp);
//printPaths(pp);
var forms =require('forms-mongoose');
var try2 = {try3: Number};
var try4 = {try5: try2};

var trySchema = exports.trySchema= new Schema({
    try: try2,
    ppp :[try4]
});

//console.log(sc.trySchema.paths.ppp.schema.paths);

var types = require('mongoose').Schema.Types;
//var Date  =require('mongoose').Schema.Types.Date;
var pop ={zzz:String,yyy: Number}
var blogSchema = new Schema({
    //body:   {type: [String],forms: {all:{}}},
    title:  {first: {type: String, forms: {all:{}}}, second: {type: String, forms: {all:{}}}},
    title2:  {type : {first: String, second:String}, forms: {all:{}}},
    email:  { type: String, unique: true, forms: {
        all: {
            type: 'email'
        }}},
    author: String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs:  Number
        //xxx: pop
    },
    teta: {type :[pop], auto:false},
    peta : pop
});
var keys =require('../../tools/utils.js').keys;
var Blog=mongoose.model('blog',blogSchema,'blog');
var blog = new Blog({title: "mytitle", "data":Date(), body:['sss'], teta : [{zzz:"zzz",yyy:3}],peta: {zzz:"zzz",yyy:3}})
//blog.save(function(err,res){console.log(err,res)});
/*Blog.findOne({_id: '523738b406e0203c48000023'}, function(err,res){
    //console.log(err,res);
    res.teta.push({zzz:'xxx', yyy:5});
    var Res = new Blog(res)
    Res.save(function(err,resu){
        //console.log("DEBUG: SAVE-2: ",err,resu);
    })
});*/

var x= new Blog;
var xSon = x.teta.create({zzz:'asd'});
//console.log('XSON',xSon);

//console.log("DUBG_ASDASDASDASDASDASD");
var innerTestSchema = new Schema({
    smallString: String,
    smallNumber: Number,
    smallDate: Date
},{_id:false})

var testSchema = new Schema({
    normalNum: Number,
    objid: types.ObjectId,
    arrayNum: [Number],
    normalStr: String,
    StringArray :[String],
    //objArray: [{}]
    //ObjectArray :[{arrayInner: [Number]}], TODO
    //schemaArray:
    normalDate: Date,
    innerDate: {innerInnerDate: Date},
    bool: Boolean,
    embed: [innerTestSchema]
    //embed1: {embed2: [require('./generalTypes.js').semTypeRefType]}



})

//console.log('SEMTYPE',require('./generalTypes.js').semTypeRefType)
//console.log(require('./generalTypes.js'))

var internalFrameRelationFEType  =exports.internalFrameRelationFEType = new Schema({
    "@name": String,
    "@ID": {type: Number,min :0 }
});

//console.log(internalFrameRelationFEType)
var testScheme3 =new Schema({aa: [internalFrameRelationFEType]})
//var testScema3Model = mongoose.model("try", testScheme3, "try")
//console.log(testScema3Model);


var testModel = mongoose.model('test',testSchema,'test');
//console.log("PRE:", (eng.frameModel.schema.paths))
//console.log("\nPOST")
function test1(){
    var form =  forms.create(Blog,{},'all', 'all');
    var paths = Blog.schema.paths;
    for (var pathName in paths) {
        var path = paths[pathName];
        var field = forms.get_field(path, "all", "all");
        if (field)
            //params = _.extend(params, field);
            console.log(pathName ,':' ,field[pathName].widget.type);
    }

}

//embedded docs - not schemas - are turning into title.subtitle.subsubtitle etc.. (this is their path)


function printPaths (p){
    var instances =[],
        others=[],
        arrays=[],
        embedded=[],
        functions = [],
        schemes=[];
    for (obj in p){
        var curr = p[obj];
        //console.log('OBJ:',obj);
        if (!curr) console.log('BUGBUGBUG: not curr',curr,obj)
        else if (curr.instance) instances.push(curr)
        else if (curr.schema && curr.caster) embedded.push(curr)
        else if (curr.schema) schemes.push(curr)
        else if (curr.caster) arrays.push(curr)
        else if (curr.options && curr.options.type && typeof(curr.options.type) =='function') functions.push(curr)
        else others.push(curr)
        //console.log(curr['path'], ":",curr['options']['type'], curr['instance']);
        if (curr['path'] == 'lexUnit'){
            //console.log(curr['path'], ":",curr['options']['type'] );
        }
    }
    return {instances: instances,others:others, schemes:schemes, arrays:arrays, functions:functions, embedded: embedded }
}

function test2(anal , prev,  results, debug){
    //var results = []
    prev = prev? prev+'.' : '';
    //console.log(keys(Blog.schema.paths))
    //console.log(Blog.schema.paths.title2)
    //console.log(Blog.schema.paths.title)
    //console.log(Blog.schema.paths.comments)
    var paths = printPaths(anal)
    //console.log(paths['instances'])
    if (debug) console.log("instances".toUpperCase())
    paths['instances'].forEach(function(obj){
        console.log(prev+obj['path'], obj['instance'])
        results.push(prev+obj['path']+' '+ obj['instance'])
    })

    if (debug) console.log("\nschemes".toUpperCase())
    paths['schemes'].forEach(function(obj){
        //console.log(obj['path'], obj['schema'].paths)})
        //console.log("printing sub schemes for:".toUpperCase(), obj['path'])
        test2(obj['schema'].paths,  obj['path'], results)
        //var subSchemes = printPaths()
    })
    if (debug) console.log("\narrays".toUpperCase())
    paths['arrays'].forEach(function(obj){
        //console.log("printing array - name:".toUpperCase(), prev+obj['path'])
        if (obj['instance']) {
            console.log(prev+obj['path'], obj['instance']);
            results.push(prev+obj['path']+' '+ obj['instance']);
        }
        else {//case: array of complex type
            if (obj.options.type) {
                if (obj.options.type[0]==undefined) {
                    console.log(prev+obj['path'], '[undefined]' )
                    results.push(prev+obj['path']+ ' '+ '[undefined]' )
                }
                else {
                    var comType =obj.options.type[0].name;
                    console.log(prev+obj['path'], '['+comType+']' ) //TODO - here!!!!
                    results.push(prev+obj['path']+' '+ '['+comType+']' )
                }

            }
        }
        //test2(obj['schema'].paths,obj['path'] )

    })

    if (debug) console.log("\nfunctions".toUpperCase())
    if (paths['functions']) paths['functions'].forEach(function(obj){
        console.log(prev+obj['path'], obj['options']['type'].name)
        results.push(prev+obj['path']+' '+ obj['options']['type'].name)
    })


    if (debug) console.log("\nembedded".toUpperCase())
    if (paths['embedded']) paths['embedded'].forEach(function(obj){
        //console.log("printing embedded schemes for:".toUpperCase(), obj['path'])
        //console.log(prev+obj['path'], obj['schema'])
        //console.log(prev+obj['path'], (obj['options']['type'][0]))
        //console.log("call to rec", results)
        test2(obj.schema.paths,  prev+obj['path']+".ARRAY", results);
        //console.log("return from rec\n", a)
       //test2(obj.schema.paths,  prev+obj['path']+".ARRAY", results)
    })


    if (debug) console.log("\nothers".toUpperCase())
    paths['others'].forEach(function(obj){
        console.log(obj['path'], obj)
        results.push("OTHER " + obj['path'], obj)

    })
    //console.log('TMPO_RESULTS:', results)
}

var rec= new Schema({str: String, recVal: [rec]})

var recModel = mongoose.model('try',rec,'try');
//console.log(recModel.schema.paths.recVal.options)
//console.log(recModel.schema.paths)
//test2(recModel.schema.paths, "")
//test2(Blog.schema.paths, "");
var embedObjSchema = new Schema({f1: {type: {f2:String, f21: [testScheme3]}}});
//test2(embedObjSchema.paths, "",1);
//console.log('engFrameSchema'.uppercase())
//test2(eng.engFrameSchema.paths,"")
//console.log('english frameLUSchema')

var obj = eng.engFrameSchema.paths
var resList = []
//test2(obj, "",resList)
//console.log(JSON.stringify(resList, null, 2));


function listSchemaTypes(){
    resultObj = {}
    var mainSchemes ={
        eng:['engFrameSchema', 'translationSchema', 'lexUnit'],
        //eng: [],
        heb: ['decisionSchema','hebFrameLUSchema', 'luSentenceSchema', 'hebsentenceSchema', 'hebFrameType']
        //heb: ['hebFrameLUSchema']
    }
    for (schema in mainSchemes){
        //console.log(schema)
        resultObj[schema] = {}
        for (name in mainSchemes[schema]){
            var results = []
            if (schema =='eng')test2(eng[mainSchemes[schema][name]].paths, "",results)
            if (schema =='heb')test2(heb[mainSchemes[schema][name]].paths, "",results)
            //console.log(name)
            resultObj[mainSchemes[schema][name]] =results;
        }

    }

    return resultObj;
}

console.log(JSON.stringify(listSchemaTypes(), null, 2))//listSchemaTypes()
    //general:[general.]}
//console.log(test2(eng.lexUnit.paths,""))
//test2(eng.engFrameSchema.paths,"")
//test2(eng.engFrameSchema.paths,"")
//console.log((mongoose.model('try2',embedObjSchema, 'try2').schema.paths.f1.options))
//console.()
//test2(testModel.schema.paths, "");
//test2(eng.frameModel.schema.paths, "");
//eng
//test1();



function fineng(){
    eng.frameModel.findOne(function(err,result){
        console.log("ENGFIND:",err, JSON.stringify(result.frame.FE))
        for (fe in result.frame.FE){
            console.log('FEID: ',fe,result.frame.FE[fe]['@ID'] )
        }
    })
}

