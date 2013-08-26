/**
 *   a
 */
var index = require('./controllers/index'),
    app = require('./app.js'),
    auth = require('./controllers/auth'),
    passport =require('passport');
    engControl = require('./controllers/english');
    engModel = require('./models/mongoDB/englishModel.js'),
    general  = require('./models/mongoDB/general.js');

var hp  = '/~imrihe/nodeJS1/';
exports.hp = hp;
console.log("hp: ",hp);

var homeLink = "<br>" + "(<a href=\""+hp+"\"> go home</a>)";
app.get('/kaki', function(req, res){
    console.log("route:",req.route);
    res.redirect(hp+"login");
    //res.send(homePath+"kaki");});
});

app.get('/', index.index);

/******************general getters***************/
app.get('/findquery', index.findQuery);  //renders the form to submit to query
app.post('/findquery', general.findQuery);  //process the query data, submit to DB and return the results


/******************english getters***************/
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
app.get('/eng/frame', engModel.loadFrame);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
app.get('/eng/lu',engModel.loadLuEng);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
app.get('/eng/luNames', engModel.loadLuNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
app.get('/eng/frameNames', engModel.loadFrameNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/annotations?lu=XXXX
app.get('/eng/annotations', engModel.loadAnnotations);


//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/eng/translations?luid=XXXX
app.get('/eng/translations', engModel.loadTranslations);



/******************hebrew getters***************/
    //http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frame/?id=320
app.get('/heb/frame', engModel.loadFrame);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/lu/?id=320
app.get('/heb/lu',engModel.loadLuEng);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=1
//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/luNames?lus=0
app.get('/heb/luNames', engModel.loadLuNames);

//http://www.cs.bgu.ac.il/~imrihe/nodeJS1/frameNames
app.get('/heb/frameNames', engModel.loadFrameNames);



app.get('/login', function(req, res){
    //res.send('login', { user: req.user, message: req.flash('error') });
    //res.render('login', { user: req.user, message: req.flash('error') });
    console.log("DEBUG: login page GET: ", req.user && req.user.username);
    res.render('login', { user: req.user, message: req.flash('error') });
});

app.get('/account', auth.ensureAuthenticated, function(req, res){
    res.send('account: user: '+req.user + homeLink);
});

app.get('/logout', function(req, res){
    req.logout();
    console.log("logging out the user");
    res.redirect(hp+'');
});

//TODO: DEBUG - use this uri to see if you are logged in
app.get('/auth',
    auth.ensureAuthenticated,
    function(req,res){
        console.log("DEBUG: responding after auth: ", req.user.username);
        res.send("authentication is OK  "+ homeLink);
    });

app.get('/checkdbconnect',
    function(req,res){
        console.log("DEBUG: checking...");
        var userScehme = require('./models/mongoDB/schemes.js').userSchema;
        var User = require('mongoose').model('User', userScehme);
        User.findOne(function(err, user){console.log("this is the one!!", err, user);});
        res.send("database connection is OK " + homeLink);
    });



//***************POSTS*************//
app.post('/login',
    passport.authenticate('local', { successRedirect: hp+'auth', failureRedirect: hp+'login', failureFlash: true  }),
    function(req, res) {
        console.log("user %s is NOW LOGGED IN", req.user.username);
        res.send("managed to authenticate!!!");
    });

