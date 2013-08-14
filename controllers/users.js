/**           a
 * New node file
 */

exports.loadUser = function loadUser(req, res, next) {
	console.log("checking if user is logged: " ,req.session.user_id==true);

  if (req.session.user_id) {
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

