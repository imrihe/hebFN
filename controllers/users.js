/**           a
 * New node file
 */

global.printModule("controllers/users");

var User = require('../models/schemes/user.js').userModel;



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
}
