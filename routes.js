/**
 *   a
 */
var index = require('./controllers/index'),
    app = require('./app.js'),
    auth = require('./controllers/auth'),
    passport =require('passport');

var hp = '/~imrihe/nodeJS1/';
var homeLink = "<br>" + "(<a href=\""+hp+"\"> go home</a>)";
app.get('/kaki', function(req, res){
    console.log("route:",req.route);
    res.redirect(hp+"login");
    //res.send(homePath+"kaki");});
});

app.get('/', index.index);


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

//TODO: DEBUG - use this uri to see if you are logged in
app.get('/auth',
    auth.ensureAuthenticated,
    function(req,res){
        console.log("DEBUG: responding after auth: ", req.user.username);
        res.send("authentication is OK  "+ homeLink);
    });

app.get('/checkdbconnect',
    function(req,res){
        console.log("DEBUG: checking...");
        var userScehme = require('./models/mongoDB/schemes.js').userSchema;
        var User = require('mongoose').model('User', userScehme);
        User.findOne(function(err, user){console.log("this is the one!!", err, user);});
        res.send("database connection is OK " + homeLink);
    });



//***************POSTS*************//
app.post('/login',
    passport.authenticate('local', { successRedirect: hp+'auth', failureRedirect: hp+'login', failureFlash: true  }),
    function(req, res) {
        console.log("user %s is NOW LOGGED IN", req.user.username);
        res.send("managed to authenticate!!!");
    });

