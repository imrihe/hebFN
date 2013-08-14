
/**a
 * Module dependencies.
 */

var express = require('express')
//, routes = require('./routes')
//, user = require('./routes/user')
	, path = require('path')
	, mongoose = require('mongoose')
	,flash = require('connect-flash')
	,auth = require('./contollers/auth')
	,passport =require('passport')
	,LocalStrategy =require('passport-local').Strategy;

//load all controllers:
var users = require('./contollers/users')
	,control = require('./contollers/index')
	,usersMong = require('././mongoDB/pull.js');

//set passport authentication:
//TODO
var users = 
	/*[
             { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
           , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
         ];*/
	passport.use(new LocalStrategy(
			  function(username, password, done) {
			    // asynchronous verification, for effect...
				  
			    process.nextTick(function () {
			    	//console.log("searching for user: ", username);
			    	findUser(username, function (err, user){
			    		if (err) { return done(err); }
			    		if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
			    		if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
			    		return done(null, user);
			    	});
			    });
			  }
	));
function findById(id, fn) {
	  var idx = id - 1;
	  if (users[idx]) {
	    fn(null, users[idx]);
	  } else {
	    fn(new Error('User ' + id + ' does not exist'));
	  }
	}

function findByUsername(username, fn) {
	  for (var i = 0, len = users.length; i < len; i++) {
	    var user = users[i];
	    if (user.username === username) {
	      return fn(null, user);
	    }
	  }
	  return fn(null, null);
	}
//TODO passport.use(auth.strat);
//auth.serializeUser;
passport.serializeUser(function(user, done) {
	console.log("serializeUser" + user);
	done(null, user.id);
});

//auth.deserializeUser;

passport.deserializeUser(function(id, done) {
	console.log("deserielize user :" + id);
  findById(id, function (err, user) {
    done(err, user);
  });
});

//TODO
passport.use(new LocalStrategy(
		  function(username, password, done) {
		    // asynchronous verification, for effect...
			  
		    process.nextTick(function () {
		    	console.log("searching for user: ", username);
				var User = mongoose.model('User', userSchema);
				User.findOne({ username: username }, function (err, user) {
					console.log("the user is: ", user);
					if (err) { return done(err); }
					if (!user) {
						console.log("unknown user");
						return done(null, false, { message: 'Incorrect username.' });
					}
					if (!user.validPassword(password)) {
						console.log("wrong password");
						return done(null, false, { message: 'Incorrect password.' });
					}
					return done(null, user);
				});
		      // Find the user by username.  If there is no user with the given
		      // username, or the password is not correct, set the user to `false` to
		      // indicate failure and set a flash message.  Otherwise, return the
		      // authenticated `user`.
		      findByUsername(username, function(err, user) {
		        if (err) { return done(err); }
		        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
		        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
		        return done(null, user);
		      })
		    });
		  }
		));

//start app:
var app = express();

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
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



app.get('/', control.index);
//the result of loadUser will be trasferred to 
//app.get('/userTest', users.loadUser, control.showUser);
app.get('/userTest2', usersMong.users);
//app.get('/try1', user.listRecords);
//app.get('/login', control.login);

app.get('/login', function(req, res){
  res.send('login', { user: req.user, message: req.flash('error') });
});

app.post('/login', 
		  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
		  function(req, res) {
		    res.send("managed to authenticate!!!");
		  });

app.get('/account', ensureAuthenticated, function(req, res){
	  res.send('account: user: '+req.user);
	});
app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
	});




app.get('/auth', passport.authenticate('local'), function(req,res){
	console.log("responding after auth: ", req.session.user);
	res.send("authentication is OK");
});
app.get('/auth1', function(req,res,next){console.log("hi hi"); req.session.user="imrihe"; next();});
app.get('/auth1', passport.authenticate('local'));

app.get('/ses', function (req,res){
	if (req.session.user =="imrihe") console.log("user logged!!");
	else console.log("user is not logged!!");
	req.login("imrihe", function(){console.log("wohhoooo"); res.send("user iis NOW logged to session-passport");});
	req.session.user = "imrihe";
	req.session.message= "hellow my man!";
	res.session= req.session;
	console.log("the session is: ", req.session);
	res.send("done session \n"+ req.session.message);
});

if (!module.parent) {
	app.listen(process.env.PORT || 3000);
	console.log("hebFNApp: Express server listening on port %d %s in %s mode", process.env.PORT || 3000, 'localhost',  app.settings.env);
}else console.log("hebFNApp is running as sub-server");

function ensureAuthenticated(req, res, next) {
		console.log("checking autentication " + req.user);
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login')
}