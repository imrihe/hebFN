/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/28/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */


printModule("routes/user");
var mailer= require('../tools/mailer.js');
//mailer.sendMail(["<imrihe@gmail.com>"],"hi, i am very glad to aannounce you as winner\n i will be happy to see you next year,\n שלום ומה שלומך יא מניאק?", "thanks for participating" );
module.exports = function(app) {
    var auth = require('./../controllers/auth');
    var userControl = require('./../controllers/users.js');
    app.get('/account', auth.ensureAuthenticated, function(req, res){
        res.send('<h2> account details stub</h2> <h3> &nbsp &nbsp user data: </h3>&nbsp &nbsp'+JSON.stringify(req.user) + homeLink);
    });


    app.get('/admin/mailreviewers', auth.ensureAuthenticated, function(req,res) {
        userControl.getReviewersMails(
            function(err, results){
                console.log("the results: ", results);
                editedResults = []
                for (recip in results){
                    editedResults.push(userControl.userToEmail(results[recip]));
                }
                res.render('mailReviewers.jade',{'mails': JSON.stringify(editedResults)});})
    });
    app.post('/admin/mailreviewers', auth.ensureAuthenticated, userControl.mailReviewers);

    app.get('/admin/listUsers', auth.ensureAuthenticated, function(req,res) {
        userControl.getUsers(req, res, function(err, results){ res.send(results)})});

    app.post('/admin/mailreviewers', auth.ensureAuthenticated, userControl.mailReviewers);
    app.get('/admin/register', auth.ensureAuthenticated, function(req,res){res.render('register.jade', {user:req.user})});
    app.post('/admin/register', auth.ensureAuthenticated, userControl.registerUser);
};


