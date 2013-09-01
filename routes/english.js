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
    app.get('/eng/frame', engControl.loadFrame);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/eng/lu',engControl.loadLuEng);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/eng/luNames', engControl.loadLuNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/eng/frameNames', engControl.loadFrameNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/annotations?lu=XXXX
    app.get('/eng/annotations', engControl.loadAnnotations);


//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/translations?luid=XXXX
    app.get('/eng/translations', engControl.loadTranslations);

    app.get('/eng/', function(req,res){ res.redirect(hp)});
}