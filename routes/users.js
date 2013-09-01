/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/user");
module.exports = function(app) {
    var auth = require('./../controllers/auth');
    app.get('/account', auth.ensureAuthenticated, function(req, res){
        res.send('<h2> account details stub</h2> <h3> &nbsp &nbsp user data: </h3>&nbsp &nbsp'+JSON.stringify(req.user) + homeLink);
    });
};


