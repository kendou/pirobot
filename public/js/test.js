/**
 * Created by huangjian on 15/8/2.
 */

var socket = new io.connect({
  'reconnection': true,
  'reconnectionDelay': 1000,
  'reconnectionDelayMax' : 5000,
  'reconnectionAttempts': 5
});

socket.on('ledMessage', function(ledMap) {
  console.log(ledMap);
});

socket.on('connect', function(){
  console.log("Connected.");
});

socket.on('connect_error', function(error){
  console.log("Connection error: " + error.toString());
});

socket.on('connect_timeout', function(){
  console.log("Connect timeout.")
});

socket.on('reconnect', function(reconnectNum){
  console.log("Reconnected after " + reconnectNum + " retries.");
});

socket.on('reconnecting', function(reconnectNum){
  console.log("Reconnection attempt number:" + reconnectNum);
});

socket.on('reconnect_error', function(error){
  console.log("Reconnection error: " + error.toString());
});

socket.on('reconnect_failed', function(){
  console.log("Reconnection failed.");
});

function onChange(e) {
  e.preventDefault();
  if(this.checked){
    $(this).parent().addClass('checked');
  }
  else{
    $(this).parent().removeClass('checked');
  }

  var commands = {};
  commands.leftforward = $('#leftforward').is(':checked');
  commands.leftback = $('#leftback').is(':checked');;
  commands.rightforward = $('#rightforward').is(':checked');;
  commands.rightback = $('#rightback').is(':checked');

  console.log(JSON.stringify(commands));
}

function onCommand(e) {
//  socket.emit('toggleLed', {led: 'led1'});
  e.preventDefault();
  console.log("DOM object with id: " + e.target.id + " clicked.");
  //TODO: emit the command(the DOM id) to the serverside here.
  socket.emit('robotCommands',{});
}

$(document).ready(function() {
  $('#leftforward').bind('change', onChange);
  $('#leftback').bind('change', onChange);
  $('#rightforward').bind('change', onChange);
  $('#rightback').bind('change', onChange);}
);


