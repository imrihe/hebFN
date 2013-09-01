/**
 *   a
 */
//TODO - think about changing into this  - http://stackoverflow.com/questions/10459291/dynamically-generate-express-routes-fails-in-production-environmentglob
printModule('routes/index');
var app = require('./../app.js'),

    engControl = require('./../controllers/english');
    hebControl = require('./../controllers/hebrew');
    genControl = require('./../controllers/hebrew');
    //engModels = require('./../models/mongoDB/englishModel.js'),
    //hebModel = require('./../models/mongoDB/hebrewModel.js'),
    //general  = require('./../models/mongoDB/general.js');


// Intercept all routes beginning with "/ajax/" TODO - check this
app.get('/ajax/?*', function(req, res, next) {
    // Set flag that the route controller can use
    console.log("DEBUG: setting ajax flag");
    req.fjAjax = true;

    next();
});

app.get('/ajax/kaki', function(req, res){
    //console.log("route:",req.route);
    console.log("AJAX STAT: ", req.fjAjax);
    res.redirect(hp+"login");
    //res.send(homePath+"kaki");});
});
app.get('/kaki', function(req, res){
    console.log("AJAX STAT: ", req.fjAjax);
    //console.log("route:",req.route);
    res.redirect(hp+"login");
    //res.send(homePath+"kaki");});
});


/******************general getters***************/
require('./general.js')(app);
//add english -all (only getters)
require('./english.js')(app);
//add authentication routes
require('./auth.js')(app);
//add users routes
require('./users.js')(app);
//add hebrew getters
require('./hebrewGetters.js')(app);
//add hebrew setters
require('./hebrewSetters.js')(app);









