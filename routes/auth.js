/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/auth");
module.exports = function(app) {
    var homeLink = "<br>" + "(<a href=\""+hp+"\"> go home</a>)";
    var auth = require('./../controllers/auth'),
        passport =require('passport');
    app.get('/login', function(req, res){
        //res.send('login', { user: req.user, message: req.flash('error') });
        //res.render('login', { user: req.user, message: req.flash('error') });
        console.log("DEBUG: login page GET: ", req.user && req.user.username);
        res.render('login', { user: req.user, message: req.flash('error') });
    });

    app.get('/account', auth.ensureAuthenticated, function(req, res){
        res.send('account: user: '+req.user + homeLink);
    });

    app.get('/logout', function(req, res){
        req.logout();
        console.log("logging out the user");
        res.redirect(hp+'');
    });

    app.get('/auth',
        auth.ensureAuthenticated,
        function(req,res){
            console.log("DEBUG: responding after auth: ", req.user.username);
            res.send("authentication is OK  "+ homeLink);
        });

    app.post('/login',
        passport.authenticate('local', { successRedirect: hp+'auth', failureRedirect: hp+'login', failureFlash: true  }),
        function(req, res) {
            console.log("user %s is NOW LOGGED IN", req.user.username);
            res.send("managed to authenticate!!!");
        });
}