var version ='1.0';
printModule("configuration file - version "+version);
module.exports= {
    version :   version,
    dbusername: 'stub',
    dbpassword: 'stub',
    emailusername: 'hebrew.framenet.bgu@gmail.com',
    emailpassword: 'kaci1501',
    hp: (process.argv[2] ? '/~imrihe/nodeJS1/':  '/~imrihe/nodeJS3/'),
    port: 3003,
    server: 'localhost',
    dbhost: 'elhadad2',
    dbport: '27017', //default port
    dbname: 'HebFrameNetDB',
    coll:{ //names of all the collections in the DB (need to suit the DBname)
        hebframes :     'hebFrames',
        hebSent:        'sentences',
        hebLuSent:      'luSentence',
        hebDecisions:   'annotatorDecisions',
        hebBadSent:     'badsentences',
        users:          'users',
        translations:   'translationsV5',
        engFrames:      'frame',
        engLUs:         'lu',
        engFullText:    'fulltext',
        history:        'history'

    }
}