

printModule("routes/hebrewSetters");

module.exports = function(app) {
    var auth = require('./../controllers/auth');
    var hebControl = require('../controllers/hebrew.js');
    var externalTools =require('../controllers/externalTools.js');

    app.get('/heb/addlutoframe', hebControl.saveLUToFrame);  //get the form for submission
    app.post('/heb/addlutoframe',auth.ensureAuthenticated, hebControl.addLUToFrame);  //process the query data, submit to DB and return the results
    app.post('/heb/fuck', function(req,res){console.log("hahaha");  res.send("fuck you!")});

    console.log("SSSSSSSSSs");
    //.app.post('/heb/addsentence', function (req,res) {console.log("hahaha"); res.send('good!');});
    console.log("SSSSSSSSSs222");
    app.get('/heb/addsentence',/*auth.ensureAuthenticated,*/ hebControl.addSentenceToLUForm);  //get the form for submission
    app.get('/ajax/heb/addsentence',/*auth.ensureAuthenticated,*/ function (req,res){
        req.isAjax =true;
        externalTools.getSE(req, res, hebControl.addSentenceToLUForm);
    });  //get the form for submission

    app.post('/heb/addsentence',/*auth.ensureAuthenticated,*/ hebControl.addSentenceToDB);  //process the query data, submit to DB and return the results
    app.post('/ajax/heb/addsentence',/*auth.ensureAuthenticated,*/ hebControl.addSentenceToDB);  //process the query data, submit to DB and return the results



    app.get('/heb/', function(req,res){ res.redirect(hp)});

};

