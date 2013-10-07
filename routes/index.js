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

app.all('*', function (req,res,next) {res.charset='utf-8'; next()}) //set the charset to be utf-8 in all routes
app.all('/ajax/*', function(req, res, next) {
    // Set flag that the route controller can use
    console.log("DEBUG: setting ajax flag");
    //console.log("DEBUG: setting ajax flag", req.path, req.url, req.uri, req.route, req.originalUrl);
    //res.isAjax = true;
    req.isAjax = true;
    //console.log('ajaxxxx', req.path, req.path.substring(req.path.indexOf('/ajax/')+6));
    res.redirect(hp+req.path.substring(req.path.indexOf('/ajax/')+6));
    //req.url = req.path.substring(req.path.indexOf('/ajax/')+5);
    //console.log('req url:', req.url);
    //next();

});

/*app.all('/?*', function(req,res){
    console.log("DEBUG: next function req is: ",
        req.isAjax,
        req.path,
        req.url);
});  */
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

app.get('/*', function(req,res,next){
    if (req.xhr) {
        console.log('received AJAX request - marking ajax flag');
        req.isAjax = true;
    }
    next()


})


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

require('./externalTools.js')(app);

//redirect all bad requests back to home page
app.all("*", function(req,res) {res.redirect(hp)});


