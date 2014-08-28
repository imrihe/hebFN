var mongoose = require('mongoose'),
    User = require('../models/schemes/user.js').userModel;


// create a user a new user
var testUser = new User({
    "firstName" : "imri",
    "lastName" : "heppner",
    "username" : "imrihe",
    "password" : "1234",
    "email" : "imrihe@post.bgu.ac.il",
    "roles" : [
        "admin",
        "annotator",
        "reviewer"
    ]
});

// save user to database
testUser.save(function(err) {
    if (err) throw err;

// fetch user and test password verification
    User.findOne({ username: 'jmar777' }, function(err, user) {
        if (err) throw err;

        // test a matching password
        user.validPassword('1234', function(err, isMatch) {
            if (err) throw err;
            console.log('Password123:', isMatch); // -&gt; Password123: true
        });

        // test a failing password
        user.validPassword('123Password', function(err, isMatch) {
            if (err) throw err;
            console.log('123Password:', isMatch); // -&gt; 123Password: false
        });
    });
});
/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 9/16/13
 * Time: 11:17 AM
 * To change this template use File | Settings | File Templates.
 */
