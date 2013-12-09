/**
 * New node file a
 */
var mongoose = require('mongoose');
var options ={  //TODO: check the good and right settings...
        server:{
            poolSize: 5,
            auto_reconnect: true,
            socketOptions:{
                keepAlive: 200,
                connectTimeoutMS:36000 //3600000,
                //keepAlive: 36000,
                //socketTimeoutMS:36000 //3600000    putting this will terminate the connection after 36 seconds!! NOTE
            }
        }
};

//console.log("DEBUG: trying to connect to DB:",'mongodb://'+conf.host+'/'+conf.dbname);
var //db = mongoose.connect('mongodb://localhost/HebFrameNetDB'),
    //db = mongoose.connect('mongodb://'+conf.dbhost+':'+conf.dbport+'/'+conf.dbname,options,  function(err)
    db = mongoose.connect('mongodb://'+conf.dbusername + ':'+ conf.dbpassword+  '@'+conf.dbhost+':'+conf.dbport+'/'+conf.dbname,options,  function(err)
            {if (err){
                console.error("connection problem!! EXITING..");
                require('../../tools/mailer.js').sendMail(["itay.mangshe@gmail.com","imrihe@gmail.com"], 'mongoDB connection is down', "mongoDB connection is down",
                    function(err,resullts){
                        process.exit(code=8);})
                 }
                    }),  //TODO { server: { auto_reconnect: false }}
    schema = mongoose.Schema;

//var user = require("./schemes.js").userSchema;
	//scheme = require('../mongoDB/schemes');




//conn = mongoose.createConnection('elhadad2', 'HebFrameNetDB'),



/*conn.on('error', function (err) {
	console.log('Error! DB Connection failed.');
});

conn.once('open', function () {
	console.log('DB Connection open!');
});*/


/*exports.framNames = function (req, res) {
	console.log("entering teamList fucntion");
	conn.db.collectionNames(function (err, names) {
		console.log("1");
		console.log("names: ", names);
		res.render('list_collections', {
			title: 'Collections list',
			collections_names: names
		});
	});
};*/

/*var user = new schema({
	firstName: String,
	lastName: String,
	username1: String,
	password: String
//	roles: Array
});*/

exports.users = function (req, res) {
	console.log("handeling user login request");
	var  userModel = mongoose.model('User', user);
	//var usersRec = new userModel();
	console.log("users model:", userModel);
	userModel.find({"username": "imrihe"}, function(err,usersRes){
		console.log("found user: ", usersRes );
		res.send(usersRes);
		//res.end();
	});
	/*conn.db.collectionNames(function (err, names) {
		console.log("1");
		console.log("names: ", names);
		res.render('list_collections', {
			title: 'Collections list',
			collections_names: names
		});
	});*/
};

