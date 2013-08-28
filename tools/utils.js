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