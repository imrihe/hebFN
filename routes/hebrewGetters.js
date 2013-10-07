
/******************hebrew getters***************/
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
printModule("routes/hebrewGetters");
function isAjax(req,res,next){
    console.log("is ajax?", req.isAjax)
    next();
}

module.exports = function(app) {
    var hebControl = require('../controllers/hebrew.js');
    var auth = require('./../controllers/auth');

    /**
     * use this call in order to get data of an english frame\s
     * request parameters: frameid, framename, luname, luid - will filter the response (number of returned frames is limited to 20 at a time)
     * @link /eng/pageframes for paginating
     */
    app.get('/heb/frame', isAjax, hebControl.getFrame);
    app.get('/heb/framedata',  hebControl.loadFrameData);

    /**
     * use this call in order to get data of an english frame\s
     * request parameters: frameid, framename, luname, luid - will filter the response (number of returned frames is limited to 20 at a time)
     * @link /eng/pageframes for paginating
     */
    app.get('/talAjax1', function(req,res){res.render('tal.jade')});//TODO- remove

    app.post('/talAjax', function(req, res){ //TODO- remove
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
    app.get('/heb/lu',hebControl.getLu);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/heb/luNames', hebControl.getSearchLus);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/heb/frameNames', hebControl.getSearchFrames);
    app.get('/heb/searchframes', hebControl.getSearchFrames);
    app.get('/heb/searchlus', hebControl.getSearchLus);


    app.get('/heb/sentences', hebControl.getListSentences);

    app.get('/heb/lusentence', hebControl.getLuSentence);
    app.get('/heb/ludata', hebControl.luAnnotationsData);
    app.get('/heb/history', hebControl.getSearchHistory);
    app.get('/heb/pageframes', hebControl.getPageFrames);

    app.get('/heb/prioritytasks', hebControl.getPriorityTasks);


    app.get('/fuck', function(req,res) {throw  new Error("fuck!!")}); //TODO- remove
    //app.get('/testadd/:num', hebControl.tryAdd); //TODO- remove

    app.get('/heb/', function(req,res){ res.redirect(hp)});

};