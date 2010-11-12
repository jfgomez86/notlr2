/* Author: Jose F. Gomez

 */

$(document).ready(function() {
  var onmessage = function (data) {
  };

  io.setPath('/client/');
  socket = new io.Socket(null, {
    port: 4567
    ,transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
  });
  socket.connect();
  console.log("Connecting with synchronization server...");
  socket.on('connect', function(data){
    console.log("Successfully connected with synchronization server!");
  });

  socket.on('message', onmessage);

});






















