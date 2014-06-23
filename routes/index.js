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

app.all('*',
    function (req,res,next) {res.charset='utf-8'; next()}) //set the charset to be utf-8 in all routes
app.all('/ajax/*', function(req, res, next) {
    // Set flag that the route controller can use
    console.log("DEBUG: setting ajax flag");
    req.isAjax = true;
    res.redirect(hp+req.path.substring(req.path.indexOf('/ajax/')+6));
    //next();
});


app.get('/docs/corpora', function (req,res){
    res.redirect('http://www.cs.bgu.ac.il/~imrihe/nodeJS3/documentation/HebFN_website/index.html');
})

app.get('/docs/about', function (req,res){ res.render('about.jade')});
/******************general getters***************/
require('./general.js')(app);

require('./pages.js')(app);

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
//app.all("*", function(req,res) {res.redirect(hp+'annotate#/')});


