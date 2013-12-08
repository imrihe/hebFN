

printModule("routes/hebrewSetters");

module.exports = function(app) {
    var auth = require('./../controllers/auth');
    var hebControl = require('../controllers/hebrew.js');
    var externalTools =require('../controllers/externalTools.js');

    //app.get('/heb/addlutoframe_old', hebControl.renderAddLUToFrame);  //get the form for submission
    //app.post('/heb/addlutoframe',auth.ensureAuthenticated, hebControl.addLUToFrame);  //process the query data, submit to DB and return the results
    /**the post should contatin:
     * frameid, luname and lexUnit.
     * the lexUnit should be a valid lu-schema type JSON
     *
     */
    //app.post('/heb/addlutoframe_old',auth.ensureAuthenticated, hebControl.postAddLuToFrame);

    //.app.post('/heb/addsentence', function (req,res) {console.log("hahaha"); res.send('good!');});
    app.get('/heb/addsentence',/*auth.ensureAuthenticated,auth.ensureRole('reviewer'), */ hebControl.addSentenceToLUForm);  //get the form for submission
    app.get('/ajax/heb/addsentence',/*auth.ensureAuthenticated,auth.ensureRole('reviewer'), */ function (req,res){
        req.isAjax =true;
        externalTools.getSE(req, res, hebControl.addSentenceToLUForm);
    });  //get the form for submission

    app.post('/heb/addsentence',/*auth  .ensureAuthenticated,*/ hebControl.addSentenceToDB);  //process the query data, submit to DB and return the results
    //app.post('/ajax/heb/addsentence',/*auth.ensureAuthenticated,*/ hebControl.addSentenceToDB);  //process the query data, submit to DB and return the results

    app.get( '/heb/addSentencesToLuPost', function(req,res) {res.render('addSentencesToLuPost2.jade')});
    app.post( '/heb/addSentencesToLU', hebControl.addSentenceToLu);


    app.get('/heb/createannotation', function(req,res){res.render('createAnnotation.jade')});
    app.post('/heb/createannotation', function(req,res) {
        hebControl.addAnnotation(req,res, function(err, result){
            if (err) res.send("ERROR! "+ err);
            else res.send(result);
        })
    });

    //app.get('/heb/setdecision', function(req,res) {res.render('setDecision.jade')});
    /*app.post('/heb/setdecision', function(req,res) {
        hebControl.setDecision(req,res,function(err,result){
            if (err) return res.send(new Error("problem setting decision"));
            res.charset='utf-8';
            res.send(result);
        })});*/


    app.get('/heb/decision', hebControl.postCreateFrameLuAssociation)
    app.get('/heb/frameLuAssociation', hebControl.postCreateFrameLuAssociation)
    app.get('/heb/addlutoframe', hebControl.postCreateFrameLuAssociation)
    app.post('/heb/frameLuAssociation', hebControl.postCreateFrameLuAssociation)


    app.get('/heb/approvedecision', hebControl.postSetDecisionApproval)

    app.get('/heb/editlu', hebControl.posteditLU)
    app.post('/heb/editlu', hebControl.posteditLU)


    app.post('/heb/rmSentFromLu', hebControl.delSentFromLU);
    app.post('/heb/markbadseg', hebControl.markAsBadSegmentd);
    app.get('/heb/lulock', hebControl.luLock);

    app.get('/heb/', function(req,res){ res.redirect(hp)});
    app.get('/heb/trysemtype', function (req,res){res.render('trysemtype.jade')});

    app.post('/heb/trysemtype', function (req,res){console.log(req.body); res.send('OK')})
    app.post('/heb/addhistory', hebControl.postHistoryFeed);
    app.post('/heb/addcomment', hebControl.postAddComment)
};  //main!

