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
  res.sendFile(__dirname + '/client/client.html');
});
app.get('/client.css', function (req, res) {
  res.sendFile(__dirname + '/client/client.css');
});
// Enable browser to access files under 'client' folder
app.use(express.static('client'));
server.listen(POST, () => {
  console.log("Pong Server started running on:", POST);
});

////Game
//Players
var players = [['available', 'available', 'available', 'available'], ['available', 'available', 'available', 'available']];
//import Room class
var Room = require("./server/room.js");
var room01 = new Room('room01');
var room02 = new Room('room02');
var rooms = [room01, room02];
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
}
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
    for (var i = 0; i < rooms.length; i++) {
      if (data.value === rooms[i].name) {
        rooms[i].calcSwitch = true;
        io.to(rooms[i].name).emit("setStart", { scoreBlue: rooms[i].scoreBlue, scoreRed: rooms[i].scoreRed });
      }
    }
  });
  //to initialize ball&paddle coordinates
  socket.on("getCoordinates", function (data) {
    for (var i = 0; i < rooms.length; i++) {
      if (data.value === rooms[i].name) {
        io.to(rooms[i].name).emit("setCoordinates",
          {
            ballX: rooms[i].ballX, 
            ballY: rooms[i].ballY,
            paddleX: rooms[i].paddleX, 
            paddleX2: rooms[i].paddleX2,
            paddleX3: rooms[i].paddleX3, 
            paddleX4: rooms[i].paddleX4
          });
      }
    }
  });

  //Control paddles
  socket.on("rightKeyDown", function (data) {
    console.log(data.room + ' ' + data.value + " :rightKey is pressed");
    for (var i = 0; i < rooms.length; i++) {
      if (data.room === rooms[i].name) {
        if (data.value === 'Player1') {
          rooms[i].rightPressed1 = true;
        } else if (data.value === 'Player2') {
          rooms[i].rightPressed2 = true;
        } else if (data.value === 'Player3') {
          rooms[i].rightPressed3 = true;
        } else if (data.value === 'Player4') {
          rooms[i].rightPressed4 = true;
        }
      }
    }
  });
  socket.on("leftKeyDown", function (data) {
    console.log(data.room + ' ' + data.value + " :leftKey is pressed");
    for (var i = 0; i < rooms.length; i++) {
      if (data.room === rooms[i].name) {
        if (data.value === 'Player1') {
          rooms[i].leftPressed1 = true;
        } else if (data.value === 'Player2') {
          rooms[i].leftPressed2 = true;
        } else if (data.value === 'Player3') {
          rooms[i].leftPressed3 = true;
        } else if (data.value === 'Player4') {
          rooms[i].leftPressed4 = true;
        }
      }
    }
  });
  socket.on("rightKeyUp", function (data) {
    console.log(data.room + ' ' + data.value + " :rightKey is released");
    for (var i = 0; i < rooms.length; i++) {
      if (data.room === rooms[i].name) {
        if (data.value === 'Player1') {
          rooms[i].rightPressed1 = false;
        } else if (data.value === 'Player2') {
          rooms[i].rightPressed2 = false;
        } else if (data.value === 'Player3') {
          rooms[i].rightPressed3 = false;
        } else if (data.value === 'Player4') {
          rooms[i].rightPressed4 = false;
        }
      }
    }
  });
  socket.on("leftKeyUp", function (data) {
    console.log(data.room + ' ' + data.value + " :leftKey is released");
    for (var i = 0; i < rooms.length; i++) {
      if (data.room === rooms[i].name) {
        if (data.value === 'Player1') {
          rooms[i].leftPressed1 = false;
        } else if (data.value === 'Player2') {
          rooms[i].leftPressed2 = false;
        } else if (data.value === 'Player3') {
          rooms[i].leftPressed3 = false;
        } else if (data.value === 'Player4') {
          rooms[i].leftPressed4 = false;
        }
      }
    }
  });
  //Pause Button
  socket.on("getPause", function () {
    console.log(chosenRoom + " Pause Button is pressed");
    for (var i = 0; i < rooms.length; i++) {
      if (chosenRoom === rooms[i].name) {
        rooms[i].calcSwitch = false;
        io.to(chosenRoom).emit("setPause");
        systemMessage = clientName + " pressed Pause Button"
        io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
      }
    }
  });
  //Reset Button
  socket.on("getReset", function (data) {
    console.log(data.value + " Reset Button is pressed");
    for (var i = 0; i < rooms.length; i++) {
      if (data.value === rooms[i].name) {
        rooms[i].scoreBlue = 0; rooms[i].scoreRed = 0;
        io.to(data.value).emit("renewScore", { scoreBlue: 0, scoreRed: 0 });
        rooms[i].ballX = 240; rooms[i].ballY = 270; rooms[i].balldy = -2;
        rooms[i].gameOverSwitch = false;
        rooms[i].calcSwitch = true;
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
