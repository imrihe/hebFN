/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 5:07 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/english");
module.exports = function(app){


    /******************english getters***************/
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
    app.get('/eng/frame', engModel.loadFrame);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
    app.get('/eng/lu',engModel.loadLuEng);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
    app.get('/eng/luNames', engModel.loadLuNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
    app.get('/eng/frameNames', engModel.loadFrameNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/annotations?lu=XXXX
    app.get('/eng/annotations', engModel.loadAnnotations);


//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/translations?luid=XXXX
    app.get('/eng/translations', engModel.loadTranslations);

}