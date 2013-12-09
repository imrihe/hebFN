/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/general");
/**<b> this function gathers all the routes of the server</b>
 *<h3> general: </h3>
 *      it is devided by topic of routes to: english, general, authentication, admin, hebrew
 * <h3> queries structure: </h3>
 *      almost each one of the queries can accept 'frameid' 'luid' 'framename' 'luname' 'sentenceid'
 *      in addition - by using strict=1 - the query will search for the exact framename or luname supplied (if)
 *
 * @param app  {express.server}
 */
function mainRoute(app){
    var genControl = require('../controllers/general.js');

    app.get('/index.html', function(req,res){res.redirect(hp)});

    /*app.get('/', function (req,res){
        res.render('index_imri.jade',{user: req.user, message:"~~welcome to the hebrew framenet~~"});
    });*/

    app.get('/checkdbconnect', genControl.checkdbconnect);


    //renders the form to submit to query
    app.get('/findquery', function (req,res){
            res.render('findQuery.jade', {"collections": genControl.collectionNames});
        }
    );

    app.get('/errortest', function(req,res,next){
        next(new Error("if you see this message so the error handled is working!"))  ;
    })

    app.get('/constants', genControl.getConstants);

    app.post('/findquery', genControl.findQuery);  //process the query data, submit to DB and return the results


}

module.exports = mainRoute;