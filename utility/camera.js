/**
 * Created by huangjian on 15/8/6.
 */
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var spawn = child_process.spawn;
var utility = require('../utility/utility');
var config = utility.nconf;

var proc;
var fileWatcher = null;
var imgPath = "public/img2/pirobot.jpg";
var imgUrlPath = "img2/pirobot.jpg";
var imgUrlPathFakeMode = "img/nopower.jpg";
var startStreaming, stopStreaming, startWatch,stopWatch;
var moduleState = {watchingFile: false}, getModuleState, setModuleState;
var io; //store the socket.io object.

//////////////////////////////////////////////////////Begin utility methods
getModuleState = function(state){
  return moduleState[state];
};
setModuleState = function(state, value){
  moduleState[state] = value;
};

/**
 * stop the camera and also the fs.watch
 */
stopStreaming = function() {
  if(config.get('fakemode') === true){
    return;
  }

  utility.log("stopping streaming ...");
  if (proc) {
    proc.kill();
    proc = null;
  }
//    fs.unwatchFile(imgPath);
  stopWatch();
};

/**
 * start the camera to capture livestream images and notify clients
 * @param io
 *    the socket.io object.
 */
startStreaming = function(ioObj) {
  io = ioObj;

  if(config.get('fakemode') == true){
    io.sockets.emit('liveStream', imgUrlPathFakeMode);
    return;
  }

  if (getModuleState('watchingFile')) {
    io.sockets.emit('liveStream', imgUrlPath);
    return;
  }

  //imgPath should exist otherwise the watch() call will fail.
  child_process.exec('touch ' + imgPath, function(){
    /*
     "-w 320 -h 240": capturing 320 x 240 image
     "-o public/img/image_stream.jpg": output to public/img/image_stream.jpg. In our case, it's a Ramdisk(tmpfs)
     "-t 999999999": run 999999999 miseconds. But somehow it stops outputing after about 2 hours
     "-tl 1000": Timelapse mode, taking picture every 1000 misecond. Better to have a value greater than 500
     "-n": no preview.

     Other options:
     "-q 50": jpeg quality 50%
     "> /home/pi/camera.log 2>&1": logs
     */
    var args = ["-w", "240", "-h", "360", "-o", imgPath, "-t", "999999999", "-tl", "1000", "-n"];
    proc = spawn('raspistill', args);
    proc.stdout.on('data', function(data){
      utility.log("[raspistill] " + data);
    });
    proc.stderr.on('data', function(data){
      utility.log("[raspistill error] " + data);
    });
    proc.on('exit', function(code, signal){
      //if "raspistill" process ends for any reason, stop watching
      utility.log("raspistill exited with code:" + code);
      stopWatch();
    });

    utility.log('Watching for changes...');

    /*
     fs.watchFile(imgPath, function(current, previous) {
     var now = new Date();
     writeLog("New image emitted " + now.toTimeString());
     io.sockets.emit('liveStream', imgUrlPath + '?_t=' + now.toTimeString());
     })
     */
    //Change from watchFile to watch
    startWatch();
  });
};

startWatch = function(){
  var watchCallback = function(event, filename){
    if( 'change' === event) {
      var now = new Date();
      io.sockets.emit('liveStream', imgUrlPath + '?_t=' + now.toTimeString());
    }
    else if( 'rename' === event) {
      //rewatch the file, otherwise the 'change' event only fire once.
      fileWatcher.close();
      fileWatcher = fs.watch(imgPath, {persistent: true}, watchCallback);
    }
  };

  utility.log("current directory:" + process.cwd() + ", about to watch: " + imgPath);
  fileWatcher = fs.watch(imgPath, {persistent: true}, watchCallback);
  utility.log("Start to watch the image file.");
  setModuleState('watchingFile', true);
};

stopWatch = function(){
  if(fileWatcher){
    utility.log("Stop watching the image file.")
    fileWatcher.close();
    fileWatcher = null;
  }
  setModuleState('watchingFile', false);
};

module.exports = {
  startStreaming: startStreaming,
  stopStreaming: stopStreaming
};