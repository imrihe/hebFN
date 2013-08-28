
/**
 * Module dependencies.
 */

console.log("DEBUG: loading main app");
var  counter = 0;
var express = require('express')
    , path = require('path')
    ,flash = require('connect-flash')
    ,passport =require('passport')
    ,LocalStrategy =require('passport-local').Strategy
    ,auth = require('./controllers/auth')
    ,toobusy = require('toobusy');
var dbConnection = require('./models/mongoDB/dbConnection.js');


toobusy.maxLag(90); //TODO
//load all controllers:
//var users = require('./contollers/users')
//var control = require('./controllers/index');



/*process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});*/

//TODO passport.use(auth.strat);
//auth.serializeUser;
passport.serializeUser(auth.serializeUser);
/*passport.serializeUser(function(user, done) {
	console.log("serializeUser" + user);
	done(null, user.username);
});*/

//auth.deserializeUser;
passport.deserializeUser(auth.deserializeUser);
/*passport.deserializeUser(function(username, done) {
	console.log("deserielize user :" + username);
	findUser(username, function (err, user) {
    done(err, user);
  });
});*/


//TODO
passport.use(new LocalStrategy(auth.localStrategyFunc));

//start app:
//var app = express();
var app = module.exports = express();


//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(function(req, res, next) {
    // check if we're toobusy() - note, this call is extremely fast, and returns
    // state that is cached at a fixed interval
    counter = counter+1;
    if (toobusy()) res.send(503, "I'm busy right now, sorry."+ counter);
    else next();
});


app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('your secret here'));
app.use(express.bodyParser());
app.use(express.methodOverride());

//app.use(express.bodyDecoder());

app.use(express.session({secret: "hebFN"}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(require('stylus').middleware({
    src: __dirname + '/views',
    dest: __dirname + '/public'
}));
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


//development only
app.configure('development', function() {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
    app.use(express.logger());
    app.use(express.errorHandler());
});

global.printModule= function(name) { console.log("DEBUG: loading module","<< "+name+" >>");};
global.hp ='/~imrihe/nodeJS1/';

require('./routes/index.js');

app.locals(require('./models/mongoDB/locals.js').localVars);

//app.get('/', control.index);
//app.get('/kaki', function(req, res){res.redirect(hp+'login');});
//app.get('/login', control.index);
/*app.get('/login', function(req, res){
    //res.send('login', { user: req.user, message: req.flash('error') });
    //res.render('login', { user: req.user, message: req.flash('error') });
    console.log("DEBUG: login page GET: ", req.user && req.user.username);
    res.render('login', { user: req.user, message: req.flash('error') });
});*/
/*app.get('/account', auth.ensureAuthenticated, function(req, res){
    res.send('account: user: '+req.user);
});*/
/*app.get('/logout', function(req, res){
    req.logout();
    console.log("logging out the user");
    res.redirect(homePath+'');
});*/



//the result of loadUser will be trasferred to 
//app.get('/userTest', users.loadUser, control.showUser);
//app.get('/userTest2', usersMong.users);
//app.get('/try1', user.listRecords);
//app.get('/login', control.login);

//asd//
/*app.post('/login',
		  passport.authenticate('local', { successRedirect: hp+'auth', failureRedirect: hp+'login', failureFlash: true  }),
		  function(req, res) {
			console.log("user %s is NOW LOGGED IN", req.user.username);
			res.send("managed to authenticate!!!");
});*/
//TODO: DEBUG - use this uri to see if you are logged in
/*app.get('/auth',
    auth.ensureAuthenticated,
    function(req,res){
        console.log("DEBUG: responding after auth: ", req.user.username);
        res.send("authentication is OK");
    });*/

//TODO: DEBUG

/*app.get('/checkdbconnect',
    function(req,res){
        console.log("DEBUG: checking...");
        var userScehme = require('./models/mongoDB/schemes.js').userSchema;
        var User = require('mongoose').model('User', userScehme);
        User.findOne(function(err, user){console.log("this is the one!!", err, user);});
        res.send("database connection is OK");
    }); */
if (!module.parent) {
    app.listen(process.env.PORT || 3000);
    console.log("hebFNApp: Express server listening on port %d %s in %s mode", process.env.PORT || 3000, 'localhost',  app.settings.env);
}else console.log("hebFNApp is running as sub-server");

exports = module.exports = app;
