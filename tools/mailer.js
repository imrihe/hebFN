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

var msg = {
    transport: transport,
    text:    "Hello! This is your newsletter, :D",
    from:    "Definitely Not Spammers <spamnot@ok.com>",
    subject: "Your Newsletter"
};


/*var maillist = [
    'Mr One <mailtest1@mailinator.com>',
    'Mr Two <mailtest2@mailinator.com>',
    'Mr Three <mailtest3@mailinator.com>',
    'Mr Four <mailtest4@mailinator.com>',
    'Mr Five <mailtest5@mailinator.com>'
];  */

//var i = 0;
/*maillist.forEach(function (to) {
    msg.to = to;
    nodemailer.sendMail(msg, function (err) {
        i += 1;
        if (err) { console.log('Sending to ' + to + ' failed: ' + err); }
        console.log('Sent to ' + to);

        if (i === maillist.length) {
            transport.close();
        }
    });
});*/


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

