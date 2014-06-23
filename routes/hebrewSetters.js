

printModule("routes/hebrewSetters");

module.exports = function(app) {
    var auth = require('./../controllers/auth');
    var hebControl = require('../controllers/hebrew.js');
    var skip = require('../tools/utils.js').skip;

    app.post( '/heb/addSentenceToLU' ,auth.ensureAuthenticated, hebControl.addSentenceToLu); //TODO


    app.post('/heb/createannotation',auth.ensureAuthenticated, function(req,res) { //TODO
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


    //app.get('/heb/decision', hebControl.postCreateFrameLuAssociation)
    //app.get('/heb/frameLuAssociation', auth.ensureAuthenticated,hebControl.postCreateFrameLuAssociation)
    //app.get('/heb/addlutoframe', hebControl.postCreateFrameLuAssociation)
    app.post('/heb/frameLuAssociation',auth.ensureAuthenticated, hebControl.postCreateFrameLuAssociation)


    app.get('/heb/approvedecision',auth.ensureAuthenticated, hebControl.postSetDecisionApproval) //TODO

    //app.get('/heb/editlu', hebControl.posteditLU)
    app.post('/heb/editlu',auth.ensureAuthenticated, hebControl.posteditLU)


    app.post('/heb/rmSentFromLu',skip, hebControl.delSentFromLU); //TODO
    app.post('/heb/markbadseg', skip, hebControl.markAsBadSegmentd);     //TODO
    app.get('/heb/lulock',auth.ensureAuthenticated, hebControl.luLock);
    app.post('/heb/addhistory',skip, hebControl.postHistoryFeed);
    app.post('/heb/addcomment',auth.ensureAuthenticated, hebControl.postAddComment)   //TODO

    app.get('/heb/getSentCorr', hebControl.getLuSentCorr);
    app.post('/heb/setSentCorr', hebControl.setLuSentCorr);


    app.get('/heb/', function(req,res){ res.redirect(hp)});
    //app.get('/heb/trysemtype', function (req,res){res.render('trysemtype.jade')});

    //app.post('/heb/trysemtype', skip, function (req,res){console.log(req.body); res.send('OK')})

};  //main!

