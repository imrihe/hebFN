/**
 *   a
 */
//TODO - think about changing into this  - http://stackoverflow.com/questions/10459291/dynamically-generate-express-routes-fails-in-production-environmentglob
printModule('routes/index');
var app = require('./../app.js'),

    engControl = require('./../controllers/english');
    engModel = require('./../models/mongoDB/englishModel.js'),
    hebModel = require('./../models/mongoDB/hebrewModel.js'),
    general  = require('./../models/mongoDB/general.js');


app.get('/kaki', function(req, res){
    console.log("route:",req.route);
    res.redirect(hp+"login");
    //res.send(homePath+"kaki");});
});


/******************general getters***************/

//add english -all (only getters)
require('./general.js')(app);
require('./english.js')(app);
//add authentication routes
require('./auth.js')(app);
//add hebrew getters
require('./hebrewGetters.js')(app);
//add hebrew setters
require('./hebrewSetters.js')(app);









