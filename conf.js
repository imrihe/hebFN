var version ='1.0';
printModule("configuration file - version "+version);
module.exports= {
    version :   version,
    dbusername: 'password', //TODO: enter the database user name here (if exists)
    dbpassword: 'elhadad2', //TODO: enter the database password here  (if exists)
    emailusername: 'hebrew.framenet.bgu@gmail.com',   //TODO: enter the email address (need to be configured as smtp)
    emailpassword: 'password',                     //TODO: enter the email password
    hp: '~nlpproj/hebfn/',                          //TODO: enter here the base uri of your project (i.e: www.cs.bgu.ac.il/~nlp..../annotate# - so  /~nlp..../ will be your hp
    port: 3003, //3003                              //TODO: enter the port you want your server to be listening on
    server: 'localhost',                            //TODO: enter the server ip or local host (def to local host)
    dbhost: 'mongoDB_host_ip',                      //TODO: ip of the mongoDB host
    dbport: '27017', //default port                 //TODO: port of the mongoDB service (normally 27017)
    dbname: 'HebFrameNetDB',                        //TODO: enter the name of your database - leave as is if you are using the HebFN data
    coll:{ //names of all the collections in the DB (need to suit the DBname)  //TODO: don't change this unless you know what you are doing
        hebframes :     'hebFrames_testing', //TODO  use fore testing : hebFrames_testing
        hebSent:        'sentences',
        hebLuSent:      'luSentence',
        hebDecisions:   'annotatorDecisions',
        hebBadSent:     'badsentences',
        users:          'users',
        translations:   'translationsV5',
        engFrames:      'frame',
        engLUs:         'lu',
        engFullText:    'fulltext',
        history:        'history',
        constants:      'constants',
        luSentCorrelation: 'luSentCorrelation'
    }
};