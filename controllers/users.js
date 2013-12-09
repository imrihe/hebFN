/**           a
 * New node file
 */

global.printModule("controllers/users");

var User = require('../models/schemes/user.js').userModel;
var mailer =require('../tools/mailer.js');


exports.loadUser_old = function loadUser_old(req, res, next) {
	console.log("checking if user is logged: " ,req.session.user_id==true);

  if (req.session.user_id) {
      console.log("firbug");
    User.findById(req.session.user_id, function(user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.redirect('/login');
  };
};



/*loads the user from the data base according to username if there is a result the callback will be called with err=null otherwise user will be set to false.
 */
var findUser = exports.findUser= function findUser(username, fn){
    console.log("DEBUG: searching user <%s> in DB: ", username);
    //mongoose.model('User', userSchema);
    User.findOne({ username: username }, function (err, user) {
        if (err) { return fn(err); }
        if (!user) {
            console.log("DEBUG: unknown user");
            return fn(null, false, { message: 'Incorrect username.' });
        }
        console.log("DEBUG: the user is: ", user.username);
        return fn(null, user);
    });
};

var userToEmail =exports.userToEmail =function userToEmail(userObj){
    return userObj['firstName']+' '+userObj['lastName']+' '+ '<'+userObj['email']+'>';
};
var getReviewersMails = exports.getReviewersMails = function getReviewersMails(cb){
    User.find({roles: 'reviewer'},{'firstName' :1, lastName:1, email:1, _id:0}, cb);
};

exports.mailReviewers = function(req, res){
    mailer.sendMail(JSON.parse(req.body['mails']), req.body['subject'], req.body['msg'], function(mailRes){res.send(mailRes)});

};

exports.mailReviewersInternal = function(sub, content, cb){
    getReviewersMails(function(err,results){
        if (!err && results){
            recips =[];
            for (rev in results){
                recips.push(userToEmail(results[rev]));
            }
            mailer.sendMail(recips, sub, content, cb);
        }else cb(err);
    })};

exports.getUsers = function(req,res,cb){
    User.find({},{'password' :0}, cb);
};

/**send e mail to a specific user, the e mail will contains the data
 *
 * @param user
 * @param data
 * @param cb
 */
function mailUser(user, data, cb){
    //user.email="imrihe@gmail.com";
    mailer.sendMail(userToEmail(user), "your new account to hebrew frameNet", JSON.stringify(data), cb);



}
var registerUser = exports.registerUser = function(req,res){
    console.log(req.body);
    var user = new User(req.body);
    user.save(function(err, resObj){
        if (err) {
            console.error(err);
            res.send("ERROR: an error occured while saving new user:<br>" +err);
        }
        else {
            console.log('DEBUG: useer was saved ',resObj);
            resObj.password = req.body.password;
            mailUser(resObj, resObj ,function (err) {res.send('the user was saved!<br>' +resObj)});
        }

    })


};