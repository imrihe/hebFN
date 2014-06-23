
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
    app.get('/heb/frame', hebControl.getFrame);
    app.get('/heb/framedata',  hebControl.loadFrameData);


    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/heb/lu',hebControl.getLu);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/heb/luNames', hebControl.getSearchLus);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/heb/frameNames', hebControl.getSearchFrames);
    app.get('/heb/searchframes', hebControl.getSearchFrames);
    app.get('/heb/searchlus', hebControl.getSearchLus);


    app.get('/heb/lusentence', hebControl.getLuSentence);
    app.get('/heb/ludata', hebControl.luAnnotationsData);


    app.get('/heb/history', hebControl.getSearchHistory);
    app.get('/heb/pageframes', hebControl.getPageFrames);
    app.get('/heb/prioritytasks', hebControl.getPriorityTasks);
    app.get('/heb/fesByFrame', hebControl.getFes);
    app.get('/heb/historybyuser', hebControl.getHistory);
    app.get('/heb/getHistory', hebControl.getHistoryByType);
    app.get('/heb/getcomments', hebControl.getComments);
    app.get('/heb/lusProgress', hebControl.getLusProgress);

    app.get('/heb/getexmsentencebylu', hebControl.getSentencesByLu);

    app.get('/heb/hist/:histType', hebControl.getHistory)
    app.get('/heb/', function(req,res){ res.redirect(hp)});


};