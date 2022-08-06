document.getElementById("gameDiv").style.display = "none";
var player = new Player();

$("#entryForm").submit(function (e) {
    player.userName = $("#nameField").val() || "John Doe";
    player.room = $("#roomsDropDownList").val();
    SOCKET.emit("client_to_server_join", {
        clientName: player.userName,
        room: player.room
    });
    document.getElementById("gameDiv").style.display = "block";
    document.getElementById("entryDiv").style.display = "none";
    e.preventDefault();
    document.getElementById('entryForm').blur();
});

$("#chatForm").submit(function (e) {
    var message = $("#chatInputField").val();
    //delete input value in text field
    $("#chatInputField").val('');
    message = player.userName + ": " + message;
    // send chat message
    SOCKET.emit("client_to_server_chat", {
        value: message,
        room: player.room
    });
    e.preventDefault();
    document.getElementById('chatForm').blur();
});


var ball1 = new Ball(COLORS.BALL_GRAY);
var paddle1 = new Paddle(0, document.getElementById("canvas").height - 10, COLORS.PLAYER_BLUE);
var paddle2 = new Paddle(0, 0, COLORS.PLAYER_RED);
var paddle3 = new Paddle(0, document.getElementById("canvas").height - 10, COLORS.PLAYER_GREEN);
var paddle4 = new Paddle(0, 0, COLORS.PLAYER_PINK)

//score
var scoreBlue = 0;
var scoreRed = 0;
var canvasMessage = '';

//Get playerNumber
SOCKET.on('setPlayerNumber', function (data) {
    player.playerNumber = data.value;
});

//Start Button
function btnStart() {
    SOCKET.emit("doStart", {
        roomName: player.room
    });
    if (canvasMessage === '') {
        canvasMessage = 'Start';
    } else { //canvasMessage === "Pause" or "player1 won"
        canvasMessage = '';
    }
    document.getElementById('btnStart').blur();
    setTimeout(() => { if (canvasMessage === 'Start') canvasMessage = ''; }, 2000);
}
SOCKET.on('setStart', function (data) {
    scoreBlue = data.scoreBlue;
    scoreRed = data.scoreRed;
    document.getElementById("btnStart").disabled = "disabled";
    document.getElementById("btnPause").disabled = "";
    document.getElementById("btnReset").disabled = "";
    render();
});

function btnPause() {
    SOCKET.emit("doPause", { roomName: player.room });
    canvasMessage = 'Pause';
    document.getElementById('btnPause').blur();
}
SOCKET.on('setPause', function () {
    document.getElementById("btnPause").disabled = "disabled";
    document.getElementById("btnStart").disabled = "";
});

function btnReset() {
    SOCKET.emit("doReset", {
        roomName: player.room
    });
    canvasMessage = '';
    document.getElementById('btnReset').blur();
}
//Receive System message from server
SOCKET.on('showSystemMessage', function (data) {
    $("#systemMessageDiv").prepend("<div>" + data.value + "</div>");
});
SOCKET.on('showCanvasMessage', function (data) {
    console.log(data.value);
    canvasMessage = data.value;
});
//score
SOCKET.on('renewScore', function (data) {
    scoreBlue = data.scoreBlue;
    scoreRed = data.scoreRed;
});