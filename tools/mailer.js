/**
 *@see http://blog.nodeknockout.com/post/34641712180/sending-email-from-node-js
 */

var nodemailer = require('nodemailer');

//var conf=require(..)
var transport = nodemailer.createTransport('SMTP', {
    host: 'smtp.gmail.com',
    secureConnection: true,
    port: 465,
    auth: {
        //user: "hebrew.framnet.bgu@googlemail.com",
        user: conf.emailusername,
        pass: conf.emailpassword
    }
});




/**
 *
 * @param mailList single mail or list of emails, each email is a string: "fname lastname <the.email@emailService.com>"
 * @param mail  - string content to be sent
 * @param subj  - string - will be sent as a subjecttogether with 'hebFN:
 */
exports.sendMail = function(mailList,subj, mail,cb ){
    var i = 0;
    if (typeof(mailList) != 'object') mailList = [mailList];
    var msg = {
        transport: transport,
        text:    mail,
        from:    "hebrew frameNet <hebrew.framenet.bgu@gmail.com>",
        subject: 'hebFN: '+subj
    };
    results= [];
    console.log('DEBUG-mailer: sending e-mails to :',mailList);
    mailList.forEach(function(to){
        msg.to = to;
        nodemailer.sendMail(msg, function (err) {
            i += 1;
            if (err) {
                console.log('DEBUG-mailer: Sending to ' + to + ' failed: ' + err);
                results.push('Sending to ' + to + ' failed: ' + err);
            }
            console.log('DEBUG-mailer: E-mail was sent to ' + to);
            results.push('E-mail was sent to ' + to);
            if (i === mailList.length) {
                transport.close();
                cb(null, results);
            }
        });
    });
};

