
/******************hebrew getters***************/
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
printModule("routes/hebrewGetters");
module.exports = function(app) {
    app.get('/heb/frame', hebModel.loadFrame);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/heb/lu',hebModel.loadLu);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/heb/luNames', hebModel.loadLuNames);

    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/heb/frameNames', hebModel.loadFrameNames);
}