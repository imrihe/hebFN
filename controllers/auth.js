/**             a
 * use according to this project: https://github.com/jaredhanson/passport-local/blob/master/examples/login/app.js
 */

global.printModule("controllers/auth.js");
var mongoose = require('mongoose');

var hp = global.hp;

var findUser = require('../controllers/users.js').findUser;
var passport = require('passport');
//,LocalStrategy = require('passport-local').Strategy

var User = require('../models/schemes/user.js').userModel;
//console.log("DEBUG: userSchema:" , userSchema);

//the function activates the model and finds the user
function findUser_old(username, fn){
	console.log("searching user <%s> in DB: ", username);
	//mongoose.model('User', userSchema);
	console.log("created model");
	User.findOne({ username: username }, function (err, user) {
		console.log("DEBUG: the user is: ", user.username);
		if (err) { return fn(err); }
		if (!user) {
			console.log("unknown user");
			return fn(null, false, { message: 'Incorrect username.' });
		}
		return fn(null, user);
	});
}


//this function will be called once the "login" call is being called by  req.login(); (in the app.get('login')
exports.serializeUser = function(user, done) {
	console.log("DEBUG: serializeUser - user is logging in:",user);
	//done(null, user.username);
    done(null, {username: user.username, roles: user.roles} );
};


exports.deserializeUser =function(username, done) {
    console.log("DEBUG: deserializeUser -:",JSON.stringify(username));
    return done(null, username)
	findUser(username, function (err, user) {
		done(err, user);
	});
};


//these function is in use everytime a user needs to be authenticated   -called automatically
/*exports.localStrategyFunc=function(username, password, done) {
    process.nextTick(function () {
    	//console.log("DEBUG: next tick");
    	console.log("DEBUG: searching for user: ", username);
    	findUser(username, function (err, user){
    		//console.log("err !user user.passwor, password:", err, user, user.password, password );
    		if (err) { return done(err); }
    		if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    		//if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
            if (! user.validPassword(password)) { return done(null, false, { message: 'Invalid password' }); }
    		//console.log("DEBUG: done next tick");
            //console.log("DEBUG: found user! ", user);

    		return done(null, user);
    	});
    });
  };*/


exports.localStrategyFunc=function(username, password, done) {
    process.nextTick(function () {
        //console.log("DEBUG: next tick");
        console.log("DEBUG: searching for user: ", username);
        findUser(username, function (err, user){
            //console.log("err !user user.passwor, password:", err, user, user.password, password );
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
            //if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }

            user.validPassword(password, function (err, isMatch){
                console.log("running the valid password functin");
                if (err) return done(err);
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }

                //sreturn done(err, user, { message: msg });
            });
            //if (! user.validPassword(password)) { return  }
            //console.log("DEBUG: done next tick");
            //console.log("DEBUG: found user! ", user);

            //return done(null, user);
        });
    });
};


//middleware methode to ensure that the current user is authorised
//TODO: expend by roles
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    console.log("authentication user!!", req.cookie)

    if (req.user){
	    console.log("checking autentication for user:  " + req.user.username, req.user);

	    if (req.isAuthenticated()) { return next(); }
    }
    var us = null;
    if (req.user) us = req.user.username;
    console.log("DEBUG: user " + us +" is not authenticated.", "redirectiong to: " + hp+'login');
	//res.redirect(hp);
    res.send(403);
};


//middleware methode to ensure that the current user had the relevant role
exports.ensureReviewer = function ensureReviewer(req, res, next) {
    if (req.user && _.indexOf(req.user.roles,'reviewer') !=-1)  return next();
    //else res.send(401,"only reviewer is allowed to do this action");
    else next(new Error(401,"only reviewer is allowed to do this action"));//res.redirect(hp+'login');
};


exports.ensureAdmin = function ensureAdmin(req, res, next) {
    if (req.user && _.indexOf(req.user.roles,'admin') !=-1)  return next();
    else res.redirect(hp+'login');
};


exports.ensureRole = function (role){
    return function (req, res, next) {
        if (req.user && _.indexOf(req.user.roles,role) !=-1)  return next();
        else next(new Error(401,"the user doesn't have the relevant role: "+role));//res.redirect(hp+'login');
    };
};







