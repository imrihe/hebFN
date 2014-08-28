/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/auth");
module.exports = function(app) {
    var homeLink = "<br>" + "(<a href=\""+global.hp+"\"> go home</a>)";
    //console.log("home link1: ", homeLink)
    var auth = require('./../controllers/auth'),
        passport =require('passport');
    app.get('/login', function(req, res){
        //res.send('login', { user: req.user, message: req.flash('error') });
        //res.render('login', { user: req.user, message: req.flash('error') });
        console.log("DEBUG: login page GET: ", req.user && req.user.username);
        res.render('login', { user: req.user, message: req.flash('error') });
    });


    /*TODO: change to this one:
            I'll assume your form is set to post and it's name is myForm.
            <a href="#" onclick="document.myForm.submit();return false;">Click to submit</a>/
    */
    app.get('/logout', function(req, res){
        console.log(req.logout)
        req.logout();
        console.log("logging out the user");
        res.redirect(hp+'');
    });

    app.post('/logout', function(req, res){
        req.logout();
        console.log("logging out the user");
        res.redirect(hp+'');
    });

    //TODO
    app.get('/auth',
        auth.ensureAuthenticated, //this middleware call will make sure that the callback function will be called only if the user is logged in other wise redirection will occur
        function(req,res){
            console.log("DEBUG: responding after auth: ", req.user.username);
            res.send("authentication is OK  "+ homeLink);
        });

    app.post('/login',
        passport.authenticate('local', { successRedirect: hp+'annotate', failureRedirect: hp+'/', failureFlash: "kaki!", successFlash: 'Welcome!'  }),
        function(req, res) {
            console.log("user %s is NOW LOGGED IN", req.user.username);
            res.send("managed to authenticate!!!");
        });
}