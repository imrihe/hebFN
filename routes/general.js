/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/general");
module.exports = function(app){
    genControl = require('../controllers/general.js');

    app.get('/', function (req,res){
        res.render('index.jade',{user: req.user, message:"~~welcome to the hebrew framenet~~"});
    });

    app.get('/checkdbconnect', genControl.checkdbconnect);


    //renders the form to submit to query
    app.get('/findquery', function (req,res){
            res.render('findQuery.jade', {"collections": genControl.collectionNames});
        }
    );

    app.post('/findquery', genControl.findQuery);  //process the query data, submit to DB and return the results


}