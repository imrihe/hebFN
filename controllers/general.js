/**
 * New node file a
 */
//var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://elhadad2/HebFrameNetDB'),
//var schema = mongoose.Schema;

//scheme = require('../mongoDB/schemes');

var engModels = require('../models/schemes/english.js');
var hebModels = require('../models/schemes/hebrew.js');
var userModel = require('../models/schemes/user.js').userModel;

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
    var model;
    switch (req.body.collection){
        case 'lu':
            model = engModels.luModel;
            break;
        case 'frame':
            model = engModels.frameModel;
            break;
        case 'hebFrames':
            model =hebModels.hebFrameModel;
            break;
        default:
            model = engModels.frameModel;
            break;
    }
    var options = JSON.parse(req.body.options);
    if (!(options['limit'] && (parseInt(options['limit']) <=20)))
        options['limit']=20;
    //var model = mongoose.model(req.body.collection, schem, req.body.collection);
    console.log("finding..");
    model.find(JSON.parse(req.body.query), JSON.parse(req.body.proj), options,
        function (err,results) {responseFunc(err,results, req,res)});
};

exports.checkdbconnect = function(req,res){
    console.log("DEBUG: checking...");
    //var userScehme = require('./../models/mongoDB/schemes.js').userSchema;
    //var User = require('mongoose').model('User', userScehme);
    userModel.findOne(function(err, user){console.log("this is the one!!", err, user);});
    res.send("database connection is OK " + global.homeLink);
};



