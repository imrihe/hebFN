//var strftime = require('strftime')


//console.log(new Date())
var log = console.log;

console.log = function(){
    //console.log(arguments)
    var df = require('console-stamp/node_modules/dateformat');
    //return df(new Date(), 'dd:mm:yy HH:MM:ss.l');
    //log.apply(console, [strftime('<%d/%m/%y %H:%M:%S:%L>')].concat(require('underscore').reduce(require('underscore').values(arguments), function(obj,acc){return obj+" "+acc})));
    log.apply(console, ['['+df(new Date(), 'dd:mm:yy HH:MM:ss.l')+']'].concat(require('underscore').reduce(require('underscore').values(arguments), function(obj,acc){return obj+" "+acc})));
};

var error = console.error;

console.error = function(){
    //console.log(arguments)
    var df = require('console-stamp/node_modules/dateformat');
    //return df(new Date(), 'dd:mm:yy HH:MM:ss.l');
    //log.apply(console, [strftime('<%d/%m/%y %H:%M:%S:%L>')].concat(require('underscore').reduce(require('underscore').values(arguments), function(obj,acc){return obj+" "+acc})));
    error.apply(console, ['['+df(new Date(), 'dd:mm:yy HH:MM:ss.l')+']'].concat(require('underscore').reduce(require('underscore').values(arguments), function(obj,acc){return obj+" "+acc})));
};