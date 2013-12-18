
/******************external tools***************/

printModule("routes/externalTools");
module.exports = function(app) {
    var externalTools = require('../controllers/externalTools.js');

    app.get('/external/', function(req,res) {res.redirect(hp)});

    /**usage exmpale:
     *localhost:3000/external/searchSentence?db=test2&from=1&to=30&diversity=true&query=$w.lemma="הלך" ; $w
     * you may put any parameter or leave it empty tp use defaults - @see<externalTools.getSE>
     */
    app.get('/external/searchSentence', externalTools.getSE);

    app.get('/external/exampleSentences', externalTools.getExampleSentences);


    app.get('/external/morph', function(req, res) {
        // Set flag that the route controller can use
        //console.log("DEBUG: trying meni form");
        res.render('morphForm.jade');
    });
    //app.get('/external/morph', function(req,res){res.});
    app.post('/external/morph', externalTools.getMorph);


    app.get('/external/depparse', function(req, res) {
        // Set flag that the route controller can use
        //console.log("DEBUG: trying meni form");
        res.render('depParseForm.jade');
    });
    //app.get('/external/morph', function(req,res){res.});
    app.post('/external/depparse', externalTools.getDepParse);
    app.get('/external/parsesentence', externalTools.getDepParse);
    app.get('/external/esQuery', function (req,res){
        externalTools.esQuery(null, function (err,result){res.send(result)});
    });
};