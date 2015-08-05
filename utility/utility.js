/**
 * Created by huangjian on 15/8/1.
 */

var nconf = require('nconf');
var internalLog;
var writeLog;
var writeError;
var writeGPIOPorts;
var gpio = {};
var gpioPortNumbers = {};
var gpioPorts = {};
var initGPIO;
var finalizeGPIO;


finalizeGPIO = function(){
  if(nconf.get('fakemode') === true){
    writeLog('finalizeGPIO: do nothing in fakemode');
    return;
  }
  for(var port in gpioPorts){
    gpioPorts[port].unexport();
    delete gpioPorts[port];
  }
}

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

writeGPIOPorts = function(portMap){
  if(nconf.get('fakemode') === true){
    writeLog('Do nothing in fakemode');
    return;
  }

  for(var portStr in portMap) {
    var port = nconf.get(portStr);
    var value = portMap[portStr];
    writeLog('port ' + portStr + ': ' + port);
    if (!port) {
      writeLog('Led undefined:' + portStr);
      continue;
    }

    gpioPorts[port].write(value, function () {
        writeLog(portStr + ' written to:' + value);
      }
    )
  }
};


//Initializing utility file
nconf.argv()
  .env()
  .file({ file: './utility/config.json' });
//Set default values
nconf.defaults({
  'port': 8080,
  'fakemode': true,
  'leftforward': 19,
  'leftback': 26,
  'rightforward': 16,
  'rightback': 20
});

writeLog('fakemode:' + nconf.get('fakemode'));
if(nconf.get('fakemode') === 'false'){
  writeLog('importing onoff module ...');
  gpio = require('onoff').Gpio;
}
initGPIO = function(){
  if(nconf.get('fakemode') === true){
    writeLog('initGPIO: do nothing in fakemode');
    return;
  }
  gpioPortNumbers.leftforward = nconf.get('leftforward');
  gpioPortNumbers.leftback = nconf.get('leftback');
  gpioPortNumbers.rightforward = nconf.get('rightforward');
  gpioPortNumbers.rightback = nconf.get('rightback');
  for(var port in gpioPortNumbers){
    gpioPorts[port] = new gpio(gpioPortNumbers[port],'out');
  }
};

module.exports = {
  nconf : nconf,
  log : writeLog,
  error : writeError,
  writeGPIOPorts : writeGPIOPorts,
  initGPIO : initGPIO,
  finalizeGPIO : finalizeGPIO
};