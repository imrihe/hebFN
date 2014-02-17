/**
 * model file for communication with the users collection in mongoDB  a
 */

var user = require("./schemes.js").userSchema;


exports.users = function (req, res) {
    console.log("handling user login request");
    var  userModel = mongoose.model('User', user);
    //var usersRec = new userModel();
    console.log("users model:", userModel);
    userModel.find({"username": "imrihe"}, function(err,usersRes){
        console.log("found user: ", usersRes );
        res.send(usersRes);
        //res.end();
    });
};