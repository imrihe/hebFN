

var mongoose = require('mongoose');

var consColl = (global.conf.coll.constants)
var consSchema = new mongoose.Schema({
    name: String,
    schemes: [String],
    values: [String]
})
var consModel = mongoose.model(global.conf.coll.constants, consSchema, global.conf.coll.constants)

exports.loadConstants = function(div) {consModel.find({},{_id:0},function(err, response){
    if (err) throw new Error("problem loading constants");
    else {
        //console.log('constants are', response.length)
        div=response;
        global.constants= response;
    }
})}