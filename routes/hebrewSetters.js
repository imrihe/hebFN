

printModule("routes/hebrewSetters");
module.exports = function(app) {
    var hebControl = require('../controllers/hebrew.js');

    app.get('/heb/addlutoframe', hebControl.saveLUToFrame);  //get the form for submission
    app.post('/heb/addlutoframe', hebControl.addLUToFrame);  //process the query data, submit to DB and return the results

    app.get('/heb/', function(req,res){ res.redirect(hp)});

}

