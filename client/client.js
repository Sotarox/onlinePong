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

// canvasMessage
var canvasMessage = '';

SOCKET.on('startRendering', (data) => {
    render();
});

//Start Button
function btnStart() {
    SOCKET.emit("doStart", {
        roomName: player.room
    });
    canvasMessage = 'Start';
    document.getElementById('btnStart').blur();
    setTimeout(() => { if (canvasMessage === 'Start') canvasMessage = ''; }, 2000);
}
SOCKET.on('setStart', () => {
    document.getElementById("btnStart").disabled = "disabled";
    document.getElementById("btnReset").disabled = "";
    document.getElementById("btnPause").disabled = "";
});

function btnPause() {
    SOCKET.emit("pressPauseButton", { roomName: player.room });
    document.getElementById('btnPause').blur();
}

function btnReset() {
    SOCKET.emit("doReset", { roomName: player.room });
    document.getElementById('btnReset').blur();
    document.getElementById("btnPause").disabled = "";
}
//Receive System message from server
SOCKET.on('showSystemMessage', (data) => {
    $("#systemMessageDiv").prepend("<div>" + data.value + "</div>");
});
SOCKET.on('showCanvasMessage', (data) => {
    console.log(data.value);
    canvasMessage = data.value;
});

SOCKET.on('gameOver', () => {
    document.getElementById("btnPause").disabled = "disabled";
});