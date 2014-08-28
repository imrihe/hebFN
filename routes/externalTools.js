
/******************external tools***************/

printModule("routes/externalTools");
module.exports = function(app) {
    var externalTools = require('../controllers/externalTools.js');

    app.get('/external/exampleSentences', externalTools.getExampleSentences);
    app.get('/external/searchById', externalTools.searchById);

    app.post('/external/addSentence', externalTools.addSentence);
};
