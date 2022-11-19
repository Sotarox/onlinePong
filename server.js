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
  var systemMessage = '';

  socket.on('client_to_server_join', (data) => {
    socket.join(data.room);
    clientName = data.clientName;
    // playerArray registration
    let room = rooms.get(data.room);
    // for (key,value) of Object.entries(javascriptObject)
    for (const [player_number, player] of Object.entries(room.players)) {
      if (player.isAvailable){
        player.isAvailable = false;
        socket.playerNumber = player_number; //set additional attribute to socket instance
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
        player1PaddleX: room.players.Player1.paddle.x,
        player1PaddleY: room.players.Player1.paddle.y,
        player2PaddleX: room.players.Player2.paddle.x,
        player2PaddleY: room.players.Player2.paddle.y,
        player3PaddleX: room.players.Player3.paddle.x,
        player3PaddleY: room.players.Player3.paddle.y,
        player4PaddleX: room.players.Player4.paddle.x,
        player4PaddleY: room.players.Player4.paddle.y
      });
  });

  // Key input handling
  socket.on("keyInput", (data) => {
    const {key, when} = data;
    let room = rooms.get(data.roomName);
    console.log(`${room.name} ${socket.playerNumber} :${data.key} key is ${data.when}`);
    if (key === "left" && when === "down") room.players[socket.playerNumber].isLeftPressed = true;
    else if (key === "right" && when === "down") room.players[socket.playerNumber].isRightPressed = true;
    else if (key === "left" && when === "up") room.players[socket.playerNumber].isLeftPressed = false;
    else if (key === "right" && when === "up") room.players[socket.playerNumber].isRightPressed = false;
  });

  // Touch handling from tablets/smartphones
  socket.on("touch", (data) => {
    const {posX, posY, when} = data;
    let room = rooms.get(data.roomName);
    console.log(`Server: ${room.name} ${socket.playerNumber} -- Touch ${when} (${posX},${posY})`);
    room.players[socket.playerNumber].touchState.posX = posX;
    room.players[socket.playerNumber].touchState.posY = posY;
    room.players[socket.playerNumber].touchState.when = when;
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
    rooms.get(room).players[socket.playerNumber].isAvailable = true;
    console.log(`${room} ${socket.playerNumber} is available`);
    systemMessage = `${clientName} left the room. Chao.`;
    io.to(room).emit("showSystemMessage", { value: systemMessage });
  });
  socket.on('disconnect', () => {
    // Do nothing. The function body was transfered to 'disconnecting' method by refactor.
    // TODO: Research if disconnect function is necessary. If not, delete this function.
  });
  //End of socket
});