/**
 * Created by huangjian on 15/8/2.
 */

var controls = ['forward', 'left', 'right', 'back'];
var logState = false;
var setInfo;

var socket = new io.connect({
  'reconnection': true,
  'reconnectionDelay': 1000,
  'reconnectionDelayMax' : 5000,
  'reconnectionAttempts': 5
});

setInfo = function(infoStr){
  $('#infoLabel').text(infoStr);
};

function onChange(e) {
  e.preventDefault();
  if(this.checked){
    $(this).parent().addClass('checked');
  }
  else{
    $(this).parent().removeClass('checked');
  }

  var commands = {};
  commands.left = $('#left').is(':checked');
  commands.right = $('#right').is(':checked');;
  commands.forward = $('#forward').is(':checked');;
  commands.back = $('#back').is(':checked');

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

//check if there's control button already held
function controlChecked(){
  for(var i in controls){
    if($('#' + controls[i]).hasClass('checked')){
      return controls[i];
    }
  }
  return null;
}
function onTouchstart(e){
  e.preventDefault();
  if(logState == false){
    setInfo('请先登录');
    return;
  }

  var control = controlChecked();
  if(control != null && control != e.target.id){
    console.log('Multi touch not allowed');
    return;
  }
  console.log('Touchstart or mousedown event detected');
  $(this).addClass('checked');
  sendControls();
}
function onTouchend(e){
  e.preventDefault();
  if(logState == false){
    return;
  }
  console.log('Touchend or mouseup event detecgted');
  $(this).removeClass('checked');
  sendControls();
}

function resetControls(){
  for(var i in controls){
    $('#'+controls[i]).removeClass('checked');
  }
}

/////////////////////////////////////////////Begin module initialization.
////////////////Socket intialization
(function(){
  socket.on('info', function(info) {
    setInfo(info);
  });

  socket.on('stateChange', function(stateInfo){
    if(stateInfo.hasOwnProperty('logState')){
      logState = stateInfo['logState'];
      if(logState == false){
        resetControls();
      }
    }
    if(stateInfo.hasOwnProperty('info')){
      setInfo(stateInfo['info']);
    }
  });

  socket.on('liveStream', function(url){
    $('#stream').attr('src',url);
  });

  socket.on('connect', function(){
    console.log("Connected.");
    logState = false;
  });

  socket.on('disconnect', function(){
    console.log("disconnected.");
    logState = false;
  });

  socket.on('connect_error', function(error){
    console.log("Connection error: " + error.toString());
    logState = false;
  });

  socket.on('connect_timeout', function(){
    console.log("Connect timeout.");
    logState = false;
  });

  socket.on('reconnect', function(reconnectNum){
    console.log("Reconnected after " + reconnectNum + " retries.");
    logState = false;
  });

  socket.on('reconnecting', function(reconnectNum){
    console.log("Reconnection attempt number:" + reconnectNum);
  });

  socket.on('reconnect_error', function(error){
    console.log("Reconnection error: " + error.toString());
    logState = false;
  });

  socket.on('reconnect_failed', function(){
    console.log("Reconnection failed.");
  });
})();

$(document).ready(function() {
  for(var i in controls){
    $('#'+controls[i]).on('touchstart mousedown', onTouchstart);
    $('#'+controls[i]).on('touchend mouseup touchcancel', onTouchend);
  }

  $('#start').on('click', function(){
    if(logState === true){
      return;
    }
    if(!$('#username').val()){
      setInfo('请输入名字');
      return;
    }
    socket.emit('login',{user: $('#username').val()});
  });
})


