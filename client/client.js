document.getElementById("gameModule").style.display = "none";
var player = new Player();

$("#enterForm").submit(function (e) {
    player.userName = $("#msgForm").val() || "John Doe";
    player.room = $("#rooms").val();
    SOCKET.emit("client_to_server_join", {
        clientName: player.userName,
        room: player.room
    });
    document.getElementById("gameModule").style.display = "block";
    document.getElementById("enterModule").style.display = "none";
    e.preventDefault();
    document.getElementById('enterForm').blur();
});

$("#chatForm").submit(function (e) {
    var message = $("#chatInputField").val();
    //delete input value in text field
    $("#chatInputField").val('');
    message = player.userName + ": " + message;
    // send chat message
    SOCKET.emit("client_to_server_chat", {
        value: message
    });
    e.preventDefault();
    document.getElementById('chatForm').blur();
});

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasMessage = '';

var ball1 = new Ball(COLORS.BALL_GRAY);
var paddle1 = new Paddle(0, canvas.height - 10, COLORS.PLAYER_BLUE);
var paddle2 = new Paddle(0, 0, COLORS.PLAYER_RED);
var paddle3 = new Paddle(0, canvas.height - 10, COLORS.PLAYER_GREEN);
var paddle4 = new Paddle(0, 0, COLORS.PLAYER_PINK)

//score
var scoreBlue = 0;
var scoreRed = 0;

//Get playerNumber
SOCKET.on('setPlayerNumber', function (data) {
    player.playerNumber = data.value;
});

//Start Button
function btnStart() {
    SOCKET.emit("getStart", {
        value: player.room
    });
    if (canvasMessage === '') {
        canvasMessage = 'Start';
    } else { //canvasMessage === "Pause" or "player1 won"
        canvasMessage = '';
    }

    function deleteCanvasMessage() {
        if (canvasMessage === 'Start') {
            canvasMessage = '';
        }
    }
    document.getElementById('btnStart').blur();
    setTimeout(deleteCanvasMessage, 2000);
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
    SOCKET.emit("getPause");
    canvasMessage = 'Pause';
    document.getElementById('btnPause').blur();
}
SOCKET.on('setPause', function () {
    document.getElementById("btnPause").disabled = "disabled";
    document.getElementById("btnStart").disabled = "";
});

function btnReset() {
    SOCKET.emit("getReset", {
        value: player.room
    });
    canvasMessage = '';
    document.getElementById('btnReset').blur();
}
//Receive System message from server
SOCKET.on('showSystemMessage', function (data) {
    $("#systemMessage").prepend("<div>" + data.value + "</div>");
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