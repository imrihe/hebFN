

printModule("routes/hebrewSetters");
module.exports = function(app) {
    app.get('/heb/savelutoframe', hebModel.saveLUToFrame);  //get the form for submission
    app.post('/heb/savelutoframe', hebModel.addLUToFrame);  //process the query data, submit to DB and return the results
}

