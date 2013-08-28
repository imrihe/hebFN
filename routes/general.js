/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */

printModule("routes/general");
module.exports = function(app){
    app.get('/', function (req,res){
        res.send("this is the home page");
    });

    app.get('/checkdbconnect',
        function(req,res){
            console.log("DEBUG: checking...");
            var userScehme = require('./../models/mongoDB/schemes.js').userSchema;
            var User = require('mongoose').model('User', userScehme);
            User.findOne(function(err, user){console.log("this is the one!!", err, user);});
            res.send("database connection is OK " + homeLink);
        });

    //renders the form to submit to query
    app.get('/findquery', function (req,res){
            res.render('findQuery.jade', {"collections": general.collectionNames});
        }
    );

    app.post('/findquery', general.findQuery);  //process the query data, submit to DB and return the results


}