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
const Room = require("./server/room.js");
const rooms = new Map([
  ['room01', new Room('room01')],
  ['room02', new Room('room02')],
]);

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
// Start rendering rooms 
// TODO: Unused room is also rendered. Improve this only when somebody enter the room.
for (const room of rooms.values()) {
  setInterval(() => room.calculate(), 10);
  setInterval(() => gameStateWatcher(room), 10);
}

//sockets start
io.on('connection', (socket) => {
  console.log(socket.id + ' connected to server with socket ver: ', socket.conn.protocol);
  var chosenRoom = '';
  var clientName = '';
  var systemMessage = '';

  socket.on('client_to_server_join', (data) => {
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
  socket.on("doStart", (data) => {
    // get reference of the room instance
    let room = rooms.get(data.roomName);
    console.log(`${room.name} Start Button is pressed`);
    room.calcSwitch = true;
    io.to(room.name).emit("setStart", { scoreBlue: room.scoreBlue, scoreRed: room.scoreRed });
  });
  //to initialize ball&paddle coordinates
  socket.on("getCoordinates", (data) => {
    let room = rooms.get(data.roomName);
    io.to(room.name).emit("setCoordinates",
      {
        ballX: room.ballX,
        ballY: room.ballY,
        paddleX: room.paddleX,
        paddleX2: room.paddleX2,
        paddleX3: room.paddleX3,
        paddleX4: room.paddleX4
      });
  });

  //Control paddles
  socket.on("rightKeyDown", (data) => {
    console.log(data.room + ' ' + data.value + " :rightKey is pressed");
    rooms.forEach((room) => {
      if (data.room === room.name) {
        if (data.value === 'Player1') {
          room.rightPressed1 = true;
        } else if (data.value === 'Player2') {
          room.rightPressed2 = true;
        } else if (data.value === 'Player3') {
          room.rightPressed3 = true;
        } else if (data.value === 'Player4') {
          room.rightPressed4 = true;
        }
      }
    });
  });
  socket.on("leftKeyDown", (data) => {
    console.log(data.room + ' ' + data.value + " :leftKey is pressed");
    rooms.forEach((room) => {
      if (data.room === room.name) {
        if (data.value === 'Player1') {
          room.leftPressed1 = true;
        } else if (data.value === 'Player2') {
          room.leftPressed2 = true;
        } else if (data.value === 'Player3') {
          room.leftPressed3 = true;
        } else if (data.value === 'Player4') {
          room.leftPressed4 = true;
        }
      }
    });
  });
  socket.on("rightKeyUp", (data) => {
    console.log(data.room + ' ' + data.value + " :rightKey is released");
    rooms.forEach((room) => {
      if (data.room === room.name) {
        if (data.value === 'Player1') {
          room.rightPressed1 = false;
        } else if (data.value === 'Player2') {
          room.rightPressed2 = false;
        } else if (data.value === 'Player3') {
          room.rightPressed3 = false;
        } else if (data.value === 'Player4') {
          room.rightPressed4 = false;
        }
      }
    });
  });
  socket.on("leftKeyUp", (data) => {
    console.log(data.room + ' ' + data.value + " :leftKey is released");
    rooms.forEach((room) => {
      if (data.room === room.name) {
        if (data.value === 'Player1') {
          room.leftPressed1 = false;
        } else if (data.value === 'Player2') {
          room.leftPressed2 = false;
        } else if (data.value === 'Player3') {
          room.leftPressed3 = false;
        } else if (data.value === 'Player4') {
          room.leftPressed4 = false;
        }
      }
    });
  });
  //Pause Button
  socket.on("doPause", (data) => {
    let room = rooms.get(data.roomName);
    console.log(`${room.name} Pause Button is pressed`);
    room.calcSwitch = false;
    io.to(room.name).emit("setPause");
    systemMessage = `${clientName} pressed Pause Button`;
    io.to(room.name).emit("showSystemMessage", { value: systemMessage });
  });
  //Reset Button
  socket.on("getReset", (data) => {
    console.log(data.value + " Reset Button is pressed");
    rooms.forEach((room) => {
      if (data.value === room.name) {
        room.scoreBlue = 0; room.scoreRed = 0;
        io.to(data.value).emit("renewScore", { scoreBlue: 0, scoreRed: 0 });
        room.ballX = 240; room.ballY = 270; room.balldy = -2;
        room.gameOverSwitch = false;
        room.calcSwitch = true;
      }
    });
  });
  //chat
  socket.on("client_to_server_chat", (data) => {
    systemMessage = data.value;
    io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
  });
  //disconnect
  socket.on('disconnect', () => {
    console.log(`${socket.id} ${chosenRoom} ${clientName} has disconnected`);

    players.forEach((player, i) => {
      player.forEach((status, k) => {
        if (status === socket.id) {
          players[i][k] = 'available';
          console.log(`room0${(i + 1)} playerNumber${(k + 1)} is available`);
        }
      });
    });
    systemMessage = clientName + ' left the room. Chao.'
    io.to(chosenRoom).emit("showSystemMessage", { value: systemMessage });
  });
  //End of socket
});

