/**
 * New node file a
 */
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://elhadad2/HebFrameNetDB'),
var schema = mongoose.Schema;

//scheme = require('../mongoDB/schemes');

var engframe = require("./schemes.js").engFrameSchema;
var englu = require("./schemes.js").lexUnit;
var hebFrames = require("./schemes.js").hebFrameType;
var responseFunc = function(err,results, req, res){
    if (err || !results){
        res.send("results not found, check your query syntax: "+ req.query+ "\n"+ req.body );
    }
    else{
        console.log("found results! sending...");
        res.send(results);
    }
};

/**the method is a response to post of mongoose query.
 * the query will be in the request body in the format {collection: "collection-name", query: {<the contenct>}, proj; {<projection content>}, options: {<options such as sort, limit etc>}
 * @param req
 * @param res
 */
exports.collectionNames = ['frame', 'lu', 'hebFrames']//TODO:no schemes yet, 'fulltext', 'translationsV2']
exports.findQuery = function findQuery (req, res) {
    console.log("handling findQuery request");
    console.log("request query is: ", req.query);

    console.log("request body is: ", req.body);
    switch (req.body.collection){
        case 'lu':
            schem = englu;
            break;
        case 'frame':
            schem =engframe;
            break;
        case 'hebFrames':
            schem =hebFrames;
            break;
        default:
            schem = frame;
            break;
    }
    var options = JSON.parse(req.body.options);
    if (!(options['limit'] && (parseInt(options['limit']) <=20)))
        options['limit']=20;
    var model = mongoose.model(req.body.collection, schem, req.body.collection);
    console.log("finding..");
    model.find(JSON.parse(req.body.query), JSON.parse(req.body.proj), options,
        function (err,results) {responseFunc(err,results, req,res)});
};


