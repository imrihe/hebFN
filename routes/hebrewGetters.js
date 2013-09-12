
/******************hebrew getters***************/
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
printModule("routes/hebrewGetters");
function isAjax(req,res,next){
    console.log("is ajax?", req.isAjax)
    next();
}
module.exports = function(app) {
    var hebControl = require('../controllers/hebrew.js');
    app.get('/heb/frame', isAjax, hebControl.loadFrame);

    app.get('/talAjax1', function(req,res){res.render('tal.jade')});

    app.post('/talAjax', function(req, res){
        var data;
        console.log("TAL:");
        console.log(req.body['text1']);
        console.log(req.body['text2']);
        console.log(req.body['text3']);
        var fs = require('fs');
        fs.writeFile("tmp/tititi2", "Hey there!", function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });
        res.send(req.body);
    } );
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/heb/lu',hebControl.loadLu);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/heb/luNames', hebControl.loadLuNames);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/heb/frameNames', hebControl.loadFrameNames);

    app.get('/heb/listsentences', hebControl.listAllSentences);

    app.get('/heb/lusentence', hebControl.luSentence);


    app.get('/heb/', function(req,res){ res.redirect(hp)});

};