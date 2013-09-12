/**
 * Created with IntelliJ IDEA.
 * User: imrihe
 * Date: 8/27/13
 * Time: 3:29 PM
 * To change this template use File | Settings | File Templates.
 */


exports.keys = function keys (obj)
{
    var keys = [];
    for(var i in obj) if (obj.hasOwnProperty(i))
    {
        keys.push(i);
    }
    return keys;
};

exports.values = function values (obj){
    objkeys = this.keys(obj);
    //console.log("hh",objkeys);
    var vals =[];
    for(var i in objkeys)
    {
        //console.log(i);
        vals.push(obj[objkeys[i]]);
    }
    return vals;
}

var spawn = require('child_process').spawn;
exports.linearizePython = function linearizePython(sentJson){
    console.log("DEBUG: linearizePython");
    var wordList = [];
    for (word in sentJson){
        wordList.push([sentJson[word]['word'], sentJson[word]['pos']])
    }

    //console.log("DEBUG: linearizePython result:", wordList );
    //var ls    = spawn('python', ['linearize.py']);
    //require('./linearize.js');
    /*var python = require('node-python');
    var os = python.import('os');
    var path = require('path');
    console.log((os.path.basename(os.getcwd()) == path.basename(process.cwd())));
    console.log(os.path.basename(os.getcwd()), "\n", path.basename(process.cwd()));
    console.log((python.import));*/



    //console.log("ls:", ls);

}
