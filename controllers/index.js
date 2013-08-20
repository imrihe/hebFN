/**       a
 * New node file
 */


exports.showUser =  function (req, res){
	res.send(req.session.req.currentUser);
};

exports.login = function (req,res){
	res.send("login page should appear");
};

exports.index = function (req,res){
	res.send("this is the home page");
};

exports.findQuery = function (req,res){
    res.render('findQuery.jade');
}