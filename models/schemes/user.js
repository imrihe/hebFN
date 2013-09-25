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
printModule('models/schemes/user');

//require the relevant schemes module from mongoose
var Schema = require('mongoose').Schema;

//each user has list of roles
var roleType = {type: String, enum:["annotator", "reviewer","planner","admin","guest"]};

//schema for the 'users' collection
var userSchema = exports.userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    roles: [roleType]
});



//use bcrypt and salt for encryption of passwords
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

userSchema.methods.validPassword = function (candidatePassword, cb) {
    console.log("validating user in : userScheme with password:", candidatePassword);
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        console.log("DEBUG-validPassword: match?",isMatch);
        if (err) return cb(err);
        cb(null, isMatch);
    });

	  /*if (password === this.password) {
	    return true; 
	  } else {
	    return false;
	  } */
};


userSchema.pre('save',function(next)
    { var user = this;
// only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR,
        function(err, salt) {
            if (err) return next(err);
            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        })
});

/**
 * english frame schema ande related subSchemes
 */
//console.log(userSchema);
var userModel = exports.userModel  =require('mongoose').model(conf.coll.users, userSchema, conf.coll.users);

