/**
 * data schemes
 * the idea is: each dataType in the DB will have it's own scheme.
 *              additionally - every scheme defines scheme unique methods (such as getters and setters) when needed - those methodes will be exposed to each object of the scheme
 *              in order to save\insert new document into the DB - we will firest define suitable model (by scheme) and then call the NEW operator with the document data.
 *              in order to query the DB - we will do modelName.find() \findOne() etc. - the result will be returned to the calledBack function sent
 */
//TODO: think - every field that appears in the schema will always be pulled and saved and casted by it's defined type, if i delete the field - it won't apper if it's empty..
//maybe it's better to work with partial schemas
//TODO: add static methodes to the schemas - http://mongoosejs.com/docs/guide.html#staticss
global.printModule('models/schemes/user');




var Schema = require('mongoose').Schema;
var MongooseModel = require('mongoose').model;
//var ObjectId = mongoose.Schema.Types.ObjectId;
//var Number = Schema.Types.Number;
//var Date = Schema.Types.Date;
var roleType = {type: String, enum:["annotator", "reviewer","planner","admin"]};

var userSchema = exports.userSchema = new Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    roles: [roleType]
});

userSchema.methods.validPassword = function (password) {
	console.log("validating user in : userScheme");
	  if (password === this.password) {
	    return true; 
	  } else {
	    return false;
	  }
};

/**
 * english frame schema ande related subSchemes
 */
//console.log(userSchema);
var userModel = exports.userModel  =require('mongoose').model('Users', userSchema, 'users');

