/**
 * Created by huangjian on 15/8/2.
 */

var controls = ['leftforward', 'leftback', 'rightforward', 'rightback'];

var socket = new io.connect({
  'reconnection': true,
  'reconnectionDelay': 1000,
  'reconnectionDelayMax' : 5000,
  'reconnectionAttempts': 5
});

socket.on('info', function(info) {
  $('#infoLabel').text(info);
});

socket.on('liveStream', function(url){
  $('#stream').attr('src',url);
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
  socket.emit('robotCommands', commands);
}

function sendControls(){
  var commands = {}
  for(var i in controls){
    commands[controls[i]] = $('#'+controls[i]).hasClass('checked');
  }
  console.log(JSON.stringify(commands));
  socket.emit('robotCommands', commands);
}

function onTouchstart(e){
  e.preventDefault();
  console.log('Touchstart or mousedown event detected');
  $(this).addClass('checked');
  sendControls();
}
function onTouchend(e){
  e.preventDefault();
  console.log('Touchend or mouseup event detecgted');
  $(this).removeClass('checked');
  sendControls();
}
$(document).ready(function() {
  for(var i in controls){
    $('#'+controls[i]).on('touchstart mousedown', onTouchstart);
    $('#'+controls[i]).on('touchend mouseup touchcancel', onTouchend);
  }

  $('#start').on('click', function(){
    socket.emit('login',{user: $('#username').val()});
  });
})


