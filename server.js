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
const Room = require("./server/Room.js");
const { exit } = require('process');
const rooms = new Map([
  ['room01', new Room('room01')],
  ['room02', new Room('room02')],
]);

// Watch if game is over. This function is called repeatedly in loop
function gameStateWatcher(room) {
  if (room.isGameOver === true) {
    if (room.scoreBlue === 3) {
      room.canvasMessage = 'Player1(Blue) & 3(Green) Won!'
    } else if (room.scoreRed === 3) {
      room.canvasMessage = 'Player2(Red) & 4(Pink) Won!'
    }
    // TODO: consider how to display the following info in client 
    //io.to(room.name).emit("showSystemMessage", { value: `Press "Reset" for rematch` });
    io.to(room.name).emit("gameOver");
  } 
}
// Start rendering rooms 
// TODO: Unused room is also rendered. Improve this only when somebody enter the room.
for (const room of rooms.values()) {
  setInterval(() => room.calculate(), 10);
  setInterval(() => gameStateWatcher(room), 10);
}

// When a user connect server, this function is firstly called
io.on('connection', (socket) => {
  console.log(socket.id + ' connected to server with socketIO version: ', socket.conn.protocol);
  var clientName = "";
  var systemMessage = "";
  var roomId = "";
  var room;

  socket.on('client_to_server_join', (data) => {
    roomId = data.room;
    socket.join(roomId);
    // playerArray registration
    room = rooms.get(roomId);
    // for (key,value) of Object.entries(javascriptObject)
    for (const [player_number, player] of Object.entries(room.players)) {
      if (player.isAvailable){
        player.isAvailable = false;
        socket.playerNumber = player_number; //set additional attribute to socket instance
        systemMessage = `${data.clientName} logged in as a ${player_number}`;
        break;
      }
      systemMessage = `${data.clientName} logged in as a Audience`;
    }
    io.to(roomId).emit("showSystemMessage", { value: systemMessage });
    io.to(socket.id).emit("startRendering");
    if (room.isGameStarted) io.to(socket.id).emit("setStart");
  });
  //Start Button
  socket.on("pressStartButton", (data) => {
    // get reference of the room instance
    console.log(`${roomId} Start Button is pressed`);
    room.isGameStarted = true;
    room.canvasMessage = "Start";
    setTimeout(() => { if(room.canvasMessage = "Start") room.canvasMessage = ""; }, 2000);
    io.to(roomId).emit("setStart");
  });
  //to initialize ball&paddle coordinates
  socket.on("getWhatToRender", (data) => {
    io.to(roomId).emit("setWhatToRender",
      {
        ballX: room.ball.x,
        ballY: room.ball.y,
        player1PaddleX: room.players.Player1.paddle.x,
        player1PaddleY: room.players.Player1.paddle.y,
        player2PaddleX: room.players.Player2.paddle.x,
        player2PaddleY: room.players.Player2.paddle.y,
        player3PaddleX: room.players.Player3.paddle.x,
        player3PaddleY: room.players.Player3.paddle.y,
        player4PaddleX: room.players.Player4.paddle.x,
        player4PaddleY: room.players.Player4.paddle.y,
        scoreBlue: room.scoreBlue,
        scoreRed: room.scoreRed,
        canvasMessage: room.canvasMessage,
        isGameStarted: room.isGameStarted,
        isGameOver: room.isGameOver,
        isPauseOn: room.isPauseOn
      });
  });

  // Key input handling
  socket.on("keyInput", (data) => {
    const {key, when} = data;
    console.log(`${roomId} ${socket.playerNumber} :${data.key} key is ${data.when}`);
    if (key === "left" && when === "down") room.players[socket.playerNumber].isLeftPressed = true;
    else if (key === "right" && when === "down") room.players[socket.playerNumber].isRightPressed = true;
    else if (key === "left" && when === "up") room.players[socket.playerNumber].isLeftPressed = false;
    else if (key === "right" && when === "up") room.players[socket.playerNumber].isRightPressed = false;
  });

  // Touch handling from tablets/smartphones
  socket.on("touch", (data) => {
    // Guard after server is down and player remains in the room.
    if (!socket.playerNumber) {
      console.log("Old Player remains. He need to reload browser")
      return;
    }
    const {posX, posY, when} = data;
    console.log(`Server: ${roomId} ${socket.playerNumber} -- Touch ${when} (${posX},${posY})`);
    room.onHandleTouch(socket.playerNumber, posX, when);
  });

  //Pause Button
  socket.on("pressPauseButton", () => {
    console.log(`${roomId} Pause Button is pressed`);
    io.to(roomId).emit("showSystemMessage", { value: `${clientName} pressed Pause Button` });
    room.isPauseOn ? room.canvasMessage = "" : room.canvasMessage = "Pause";
    room.isPauseOn = !room.isPauseOn;
  });
  //Reset Button
  socket.on("pressResetButton", () => {
    room.reset();
    console.log(`${roomId} Reset Button is pressed`);
    room.canvasMessage = "Start";
    setTimeout(() => { if(room.canvasMessage = "Start") room.canvasMessage = ""; }, 2000);
  });
  //chat
  socket.on("pressChatSendButton", (data) => {
    io.to(roomId).emit("showSystemMessage", { value: data.message });
  });
  //disconnect
  socket.on("disconnecting", () => {
    // socket.rooms is the Set contains all rooms disconnecting user belonged to.
    // E.g. { 'CYDIRvJe3-WWB0T5AAAD', 'room01' } 
    // where the 0th element(CYD...) is the room in which only the user belonged to.  
    const room_ = Array.from(socket.rooms)[1];
    if (!rooms.get(room_)) {
      console.log("Unknown old user, who stays in the room before server reboot, has disconnected");
      return;
    }
    console.log(`${socket.id} ${room_} ${clientName} has disconnected`);
    // release playerNumber
    rooms.get(room_).players[socket.playerNumber].isAvailable = true;
    console.log(`${room_} ${socket.playerNumber} is available`);
    systemMessage = `${clientName} left the room. Chao.`;
    io.to(room_).emit("showSystemMessage", { value: systemMessage });
  });
  socket.on('disconnect', () => {
    // Do nothing. The function body was transfered to 'disconnecting' method by refactor.
    // TODO: Research if disconnect function is necessary. If not, delete this function.
  });
  //End of socket
});