/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 5:07 PM
 * To change this template use File | Settings | File Templates.
 */


//engModels is implicitly defined in routes/index.js
printModule("routes/english");
module.exports = function(app){
    var engControl = require('../controllers/english.js')
    //console.log("DEBUG: checking path to english model\n:",engModels, engModels.loadFrame);
    /******************english getters***************/
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
    app.get('/eng/frame', engControl.getFrame);



//app.get('/eng/frame', engControl.loadLuEng);
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/eng/lu',engControl.getLu);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/eng/luNames', engControl.getLuNames);
    app.get('/eng/luNames1', engControl.getLuNames1);
    app.get('/eng/searchlus', engControl.getSearchLus);
    app.get('/eng/searchframes', engControl.getSearchFrames);
    app.get('/eng/frameNames', engControl.getSearchFrames);


//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    //app.get('/eng/frameNames', engControl.getFrameNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/annotations?lu=XXXX
    app.get('/eng/annotations', engControl.getAnnotations);


//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/translations?luid=XXXX
    app.get('/eng/translations', engControl.getTranslations);

    app.get('/eng/', function(req,res){ res.redirect(hp)});
}