
/******************hebrew getters***************/
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
printModule("routes/hebrewGetters");
module.exports = function(app) {
    var hebControl = require('../controllers/hebrew.js');
    app.get('/heb/frame', hebControl.loadFrame);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/heb/lu',hebControl.loadLu);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/heb/luNames', hebControl.loadLuNames);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/heb/frameNames', hebControl.loadFrameNames);

    app.get('/heb/listsentences', hebControl.listAllSentences);

    app.get('/heb/', function(req,res){ res.redirect(hp)});

};