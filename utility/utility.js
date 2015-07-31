/**
 * Created by huangjian on 15/8/1.
 */

var nconf = require('nconf');
var internalLog;
var writeLog;
var writeError;

//Initializing utility file
nconf.argv()
  .env()
  .file({ file: './utility/config.json' });
//Set default values
nconf.defaults({
  'port': 8080,
  'fakemode': false
});

internalLog = function(logStr, backendLogFunc) {
  backendLogFunc(logStr);
};

writeLog = function(logStr){
  var now = new Date();
  var timeString = "[" + now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate()
    + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "]";
//  console.log(timeString + logStr);
  internalLog(timeString + logStr, console.log);
};

writeError = function(logStr){
  var now = new Date();
  var timeString = "[" + now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate()
    + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "]";
//  console.error(timeString + logStr);
  internalLog(timeString + logStr, console.error);
};

module.exports = {
  nconf : nconf,
  log : writeLog,
  error : writeError
};