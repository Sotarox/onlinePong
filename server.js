//Server basic functions
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
var POST = process.env.PORT || 8080;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client.html');
});
app.get('/client.css', function (req, res) {
  res.sendFile(__dirname + '/client.css');
});
// Enable browser to access files under components folder
app.use(express.static('components'));
server.listen(POST, () => {
  console.log("Pong Server started running on:", POST);
});

////Game
//Players
var players = [['available', 'available', 'available', 'available'], ['available', 'available', 'available', 'available']];
//import Room class
var Room = require("./moduleRoom.js");
var room01 = new Room('room01');
var room02 = new Room('room02');
var roomArray = [room01, room02];
setInterval(function () { room01.calculate() }, 10);
setInterval(function () { room02.calculate() }, 10);

function gameStateWatcher(room) {
  //watch scores
  if (room.scoreRenewSwitch === true) {
    io.to(room.name).emit("renewScore", { scoreBlue: room.scoreBlue, scoreRed: room.scoreRed });
    room.scoreRenewSwitch = false;
  }
  //watch gameOver
  if (room.gameOverSwitch === true) {
    var systemMessage = '';
    var canvasMessage = '';
    if (room.scoreBlue === 3) {
      canvasMessage = 'Player1(Blue) & 3(Green) Won!'
    } else if (room.scoreRed === 3) {
      canvasMessage = 'Player2(Red) & 4(Pink) Won!'
    }
    systemMessage = 'Press "Reset" for rematch'
    io.to(room.name).emit("showSystemMessage", { value: systemMessage });
    io.to(room.name).emit("showCanvasMessage", { value: canvasMessage });
    room.gameOverSwitch = false;
  }
}//end of gameStateWatcher
setInterval(function () { gameStateWatcher(room01) }, 10);
setInterval(function () { gameStateWatcher(room02) }, 10);

//sockets start
io.on('connection', socket => {
  console.log(socket.id + ' connected to server with socket ver: ', socket.conn.protocol);
  var chosenRoom = '';
  var clientName = '';
  var systemMessage = '';

  socket.on('client_to_server_join', data => {
    chosenRoom = data.room;
    socket.join(chosenRoom);
    clientName = data.clientName;
    systemMessage = data.clientName + ' logged in as a Audience'
    //playerArray registration
    for (var i = 0; i < players.length; i++) {
      if (data.room === 'room0' + (i + 1)) {
        for (var k = 0; k < players[i].length; k++) {
          if (players[i][k] === 'available') {
            players[i][k] = socket.id;
            var playerNumber = 'Player' + (k + 1);
            io.to(socket.id).emit('setPlayerNumber', { value: playerNumber });
            console.log('room0' + (i + 1) + ' ' + playerNumber + ' is ' + players[i][k]);
            //overwrite systemMessage from 'guest' to 'playerNumber'
            systemMessage = clientName + ' logged in as a ' + playerNumber;
            break;
          }
        }
      }
    }
    io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
  });
  //Start Button
  socket.on("getStart", function (data) {
    console.log(data.value + " Start Button is pressed");
    for (var i = 0; i < roomArray.length; i++) {
      if (data.value === roomArray[i].name) {
        roomArray[i].calcSwitch = true;
        io.to(roomArray[i].name).emit("setStart", { scoreBlue: roomArray[i].scoreBlue, scoreRed: roomArray[i].scoreRed });
      }
    }
  });
  //to initialize ball&paddle coordinates
  socket.on("getCoordinates", function (data) {
    for (var i = 0; i < roomArray.length; i++) {
      if (data.value === roomArray[i].name) {
        io.to(roomArray[i].name).emit("setCoordinates",
          {
            positionX: roomArray[i].x, positionY: roomArray[i].y,
            paddleX: roomArray[i].paddleX, paddleX2: roomArray[i].paddleX2,
            paddleX3: roomArray[i].paddleX3, paddleX4: roomArray[i].paddleX4
          });
      }
    }
  });

  //Control paddles
  socket.on("rightKeyDown", function (data) {
    console.log(data.room + ' ' + data.value + " :rightKey is pressed");
    for (var i = 0; i < roomArray.length; i++) {
      if (data.room === roomArray[i].name) {
        if (data.value === 'Player1') {
          roomArray[i].rightPressed1 = true;
        } else if (data.value === 'Player2') {
          roomArray[i].rightPressed2 = true;
        } else if (data.value === 'Player3') {
          roomArray[i].rightPressed3 = true;
        } else if (data.value === 'Player4') {
          roomArray[i].rightPressed4 = true;
        }
      }
    }
  });
  socket.on("leftKeyDown", function (data) {
    console.log(data.room + ' ' + data.value + " :leftKey is pressed");
    for (var i = 0; i < roomArray.length; i++) {
      if (data.room === roomArray[i].name) {
        if (data.value === 'Player1') {
          roomArray[i].leftPressed1 = true;
        } else if (data.value === 'Player2') {
          roomArray[i].leftPressed2 = true;
        } else if (data.value === 'Player3') {
          roomArray[i].leftPressed3 = true;
        } else if (data.value === 'Player4') {
          roomArray[i].leftPressed4 = true;
        }
      }
    }
  });
  socket.on("rightKeyUp", function (data) {
    console.log(data.room + ' ' + data.value + " :rightKey is released");
    for (var i = 0; i < roomArray.length; i++) {
      if (data.room === roomArray[i].name) {
        if (data.value === 'Player1') {
          roomArray[i].rightPressed1 = false;
        } else if (data.value === 'Player2') {
          roomArray[i].rightPressed2 = false;
        } else if (data.value === 'Player3') {
          roomArray[i].rightPressed3 = false;
        } else if (data.value === 'Player4') {
          roomArray[i].rightPressed4 = false;
        }
      }
    }
  });
  socket.on("leftKeyUp", function (data) {
    console.log(data.room + ' ' + data.value + " :leftKey is released");
    for (var i = 0; i < roomArray.length; i++) {
      if (data.room === roomArray[i].name) {
        if (data.value === 'Player1') {
          roomArray[i].leftPressed1 = false;
        } else if (data.value === 'Player2') {
          roomArray[i].leftPressed2 = false;
        } else if (data.value === 'Player3') {
          roomArray[i].leftPressed3 = false;
        } else if (data.value === 'Player4') {
          roomArray[i].leftPressed4 = false;
        }
      }
    }
  });
  //Pause Button
  socket.on("getPause", function () {
    console.log(chosenRoom + " Pause Button is pressed");
    for (var i = 0; i < roomArray.length; i++) {
      if (chosenRoom === roomArray[i].name) {
        roomArray[i].calcSwitch = false;
        io.to(chosenRoom).emit("setPause");
        systemMessage = clientName + " pressed Pause Button"
        io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
      }
    }
  });
  //Reset Button
  socket.on("getReset", function (data) {
    console.log(data.value + " Reset Button is pressed");
    for (var i = 0; i < roomArray.length; i++) {
      if (data.value === roomArray[i].name) {
        roomArray[i].scoreBlue = 0; roomArray[i].scoreRed = 0;
        io.to(data.value).emit("renewScore", { scoreBlue: 0, scoreRed: 0 });
        roomArray[i].x = 240; roomArray[i].y = 270; roomArray[i].dy = -2;
        roomArray[i].gameOverSwitch = false;
        roomArray[i].calcSwitch = true;
      }
    }

  });
  //chat
  socket.on("client_to_server_chat", function (data) {
    systemMessage = data.value;
    io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
  });
  //disconnect
  socket.on('disconnect', function () {
    systemMessage = socket.id + ' ' + ' ' + chosenRoom + ' ' + clientName + ' has disconnected';
    console.log(systemMessage);
    for (var i = 0; i < players.length; i++) {
      for (var k = 0; k < players[i].length; k++) {
        if (players[i][k] === socket.id) {
          players[i][k] = 'available';
          console.log('room0' + (i + 1) + ' playerNumber ' + (k + 1) + ' is available');
          break;
        }
      }
    }
    systemMessage = clientName + ' left the room. Chao.'
    io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
  });
});
