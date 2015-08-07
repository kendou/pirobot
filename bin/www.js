#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('pirobot:server');
var http = require('http');
var utility = require('../utility/utility');
var config = utility.nconf;
var camera = require('../utility/camera');
var currentUserSocket = null; //The socket which is controlling the robot.
var sendClientInfo,sendStateChange, broadcastInfo, userTimeUp, countDown;
var timeLeft = 60,intervalId;
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || config.get('port'));
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('socket.io')(server);

var sockets = {};

/**
 * Utility function: sendInfo
 */
sendClientInfo = function(socket, info){
  socket.emit('info',info);
};
sendStateChange = function(socket, stateInfo){
  socket.emit('stateChange', stateInfo);
}
/**
 * Utility function: broadcastInfo
 * @param info
 */
broadcastInfo = function(info){
  io.emit('info', info);
};
/**
 * Utility function: userTimeUp
 */
userTimeUp = function(){
  if(currentUserSocket == null){
    return;
  }
  sendStateChange(currentUserSocket, {
    logState: false,
  });
  broadcastInfo('闲置中');
  currentUserSocket = null;
  clearInterval(intervalId);
};

countDown = function(){
  if(currentUserSocket === null){
    return;
  }
  timeLeft --;
  if(timeLeft > 0){
    broadcastInfo(currentUserSocket.user + ' 控制时间:' + timeLeft + '秒');
  }
  else{
    userTimeUp();
  }
};

io.on('connection', function(socket) {

  sockets[socket.id] = socket;

  utility.log("Connected from " + socket.request.socket.remoteAddress
    + " Total clients connected : " + Object.keys(sockets).length);
  if(Object.keys(sockets).length === 1){
    utility.log("first client, initlizing GPIO ports and camera...");
    utility.initGPIO();
    camera.startStreaming(io);
  }

  socket.on('disconnect', function() {
    if(currentUserSocket === socket){
      userTimeUp();
    }

    delete sockets[socket.id];
    utility.log("Total clients connected : " + Object.keys(sockets).length);
    if(Object.keys(sockets).length === 0){
      utility.log("No clients left, releasing GPIO ports and the camera...");
      utility.finalizeGPIO();
      camera.stopStreaming();
    }
  });

  socket.on('robotCommands', function(robotCommands) {
    utility.log('received robotCommands:' + JSON.stringify(robotCommands));
    utility.writeGPIOPorts(robotCommands);
  });

  socket.on('login', function(userMap){
    if(currentUserSocket === null){
      utility.log('login request:' + JSON.stringify(userMap));
      socket.user = userMap.user;
      currentUserSocket = socket;
      sendStateChange(socket, {
        logState: true,
        info: currentUserSocket.user + ' 正在控制中'
      });

      timeLeft = config.get('maxtime');
      intervalId = setInterval(countDown, 1000);
    }
    else{
      sendClientInfo(socket, currentUserSocket.user + ' 正在控制中');
    }
  });

});

/**
 * Listen on provided port, on all network interfaces.
 */

utility.log("Listening on port:" + port);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

process.on('SIGINT', function() {
  utility.log('Received Signal, releasing GPIO ports and the camera...');
  utility.finalizeGPIO();
  camera.stopStreaming();
  process.exit(1);
});
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      utility.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      utility.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
