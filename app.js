
/**
 * Module dependencies.
 */

console.log("DEBUG: loading main app");
global.printModule= function(name) { console.log("DEBUG: loading module","<< "+name+" >>");};
global.hp ="/";//from home user "/" //TODO
//global.hp ='/~imrihe/nodeJS1/';
global.homeLink = "<br>" + "(<a href=\""+hp+"\"> go home</a>)";



var  counter = 0;
var express = require('express')
    , path = require('path')
    ,flash = require('connect-flash')
    ,passport =require('passport')
    ,LocalStrategy =require('passport-local').Strategy
    ,auth = require('./controllers/auth')
    ,toobusy = require('toobusy');
var dbConnection = require('./models/mongoDB/dbConnection.js');

//TODO - check how to handle uncouight exception - restart server or something and send exception to email or log..
/*process.on('uncaughtException', function (err) {
 console.error(err);
 console.log("Node NOT Exiting...");
 });*/


toobusy.maxLag(90); //TODO - check scalability




//auth.serializeUser;
passport.serializeUser(auth.serializeUser);
//auth.deserializeUser;
passport.deserializeUser(auth.deserializeUser);
//define the strategy for the authentication engine - the function defines how the user will be authenticated
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


require('./routes/index.js');

app.locals(require('./models/schemes/locals.js').localVars);





if (!module.parent) {
    app.listen(process.env.PORT || 3000);
    console.log("hebFNApp: Express server listening on port %d %s in %s mode", process.env.PORT || 3000, 'localhost',  app.settings.env);
}else console.log("hebFNApp is running as sub-server");

exports = module.exports = app;
