/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 12/9/13
 * Time: 2:19 PM
 * To change this template use File | Settings | File Templates.
 */

var auth = require('./../controllers/auth');
module.exports = function(app){
    //app.all('/api/:action', routes.api);


    /*
     * GET home page.
     */
    var fs = require('fs');

    function home(req, res){
        res.render('index', { title: 'HebFN', user: req.user });
    }

    function serialize(obj) {
        var str = [];
        for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }




    function annotatePartials(req, res){
        fs.exists(__dirname+'/../views/ann_partials/'+req.params.partial+".jade", function(exists) {
            if (exists) {
                res.render('ann_partials/'+req.params.partial, { title: 'HebFN' });
            } else {
                res.render('error', {details:"Partial Missing:"+req.params.partial});
            }
        });

    }

    function explore(req, res){
        //res.render('explore', { title: 'HebFN' });
        res.send('under construction');
    }

    function annotate(req, res){
        res.render('annotate', {  });
    }



    app.get('/annotate/partials/:partial',auth.ensureAuthenticated, annotatePartials);
    app.get('/annotate',auth.ensureAuthenticated, annotate);

    app.get('/explore', explore);
    app.get('/', home);


















}