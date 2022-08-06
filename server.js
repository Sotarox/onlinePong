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
  console.log(socket.id + ' connected to server with socketIO version: ', socket.conn.protocol);
  var clientName = '';
  var playerNumber = '';
  var systemMessage = '';

  socket.on('client_to_server_join', (data) => {
    socket.join(data.room);
    clientName = data.clientName;
    // playerArray registration
    let room = rooms.get(data.room);
    for (const [player_number, player] of Object.entries(room.players)) {
      if (player.isAvailable){
        player.isAvailable = false;
        playerNumber = player_number;
        io.to(socket.id).emit('setPlayerNumber', { value: player_number });
        systemMessage = `${clientName} logged in as a ${player_number}`;
        break;
      }
      systemMessage = `${data.clientName} logged in as a Audience`;
    }
    io.to(data.room).emit("showSystemMessage", { value: systemMessage });
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
    let room = rooms.get(data.roomName);
    console.log(`${room.name} ${data.playerNumber} :rightKey is pressed`);
    if (data.playerNumber === 'Player1') {
      room.rightPressed1 = true;
    } else if (data.playerNumber === 'Player2') {
      room.rightPressed2 = true;
    } else if (data.playerNumber === 'Player3') {
      room.rightPressed3 = true;
    } else if (data.playerNumber === 'Player4') {
      room.rightPressed4 = true;
    }
  });
  socket.on("leftKeyDown", (data) => {
    let room = rooms.get(data.roomName);
    console.log(`${room.name} ${data.playerNumber} :leftKey is pressed`);
    if (data.playerNumber === 'Player1') {
      room.leftPressed1 = true;
    } else if (data.playerNumber === 'Player2') {
      room.leftPressed2 = true;
    } else if (data.playerNumber === 'Player3') {
      room.leftPressed3 = true;
    } else if (data.playerNumber === 'Player4') {
      room.leftPressed4 = true;
    }
  });
  socket.on("rightKeyUp", (data) => {
    let room = rooms.get(data.roomName);
    console.log(`${room.name} ${data.playerNumber} :rightKey is released`);
    if (data.playerNumber === 'Player1') {
      room.rightPressed1 = false;
    } else if (data.playerNumber === 'Player2') {
      room.rightPressed2 = false;
    } else if (data.playerNumber === 'Player3') {
      room.rightPressed3 = false;
    } else if (data.playerNumber === 'Player4') {
      room.rightPressed4 = false;
    }
  });
  socket.on("leftKeyUp", (data) => {
    let room = rooms.get(data.roomName);
    console.log(`${room.name} ${data.playerNumber} :leftKey is released`);
    if (data.playerNumber === 'Player1') {
      room.leftPressed1 = false;
    } else if (data.playerNumber === 'Player2') {
      room.leftPressed2 = false;
    } else if (data.playerNumber === 'Player3') {
      room.leftPressed3 = false;
    } else if (data.playerNumber === 'Player4') {
      room.leftPressed4 = false;
    }
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
  socket.on("doReset", (data) => {
    let room = rooms.get(data.roomName);
    room.reset();
    console.log(`${room.name} Reset Button is pressed`);
    io.to(data.value).emit("renewScore", { scoreBlue: 0, scoreRed: 0 });
  });
  //chat
  socket.on("client_to_server_chat", (data) => {
    systemMessage = data.value;
    io.to(data.room).emit("showSystemMessage", { value: systemMessage });
  });
  //disconnect
  socket.on("disconnecting", () => {
    // socket.rooms is the Set contains all rooms disconnecting user belonged to.
    // E.g. { 'CYDIRvJe3-WWB0T5AAAD', 'room01' } 
    // where the 0th element(CYD...) is the room in which only the user belonged to.  
    const room = Array.from(socket.rooms)[1];
    if (!rooms.get(room)) {
      console.log("Unknown old user, who stays in the room before server reboot, has disconnected");
      return;
    }
    console.log(`${socket.id} ${room} ${clientName} has disconnected`);
    // release playerNumber
    rooms.get(room).players[playerNumber].isAvailable = true;
    console.log(`${room} ${playerNumber} is available`);
    systemMessage = `${clientName} left the room. Chao.`;
    io.to(room).emit("showSystemMessage", { value: systemMessage });
  });
  socket.on('disconnect', () => {
    // Do nothing. The function body was transfered to 'disconnecting' method by refactor.
    // TODO: Research if disconnect function is necessary. If not, delete this function.
  });
  //End of socket
});