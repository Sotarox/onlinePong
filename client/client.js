var socket = io();
  
document.getElementById("gameModule").style.display = "none";
let userName = '';
var chosenRoom = '';

$("#enterForm").submit(function (e) {
    userName = $("#msgForm").val() || "John Doe";
    chosenRoom = $("#rooms").val();
    socket.emit("client_to_server_join", {
        room: chosenRoom,
        clientName: userName
    });
    document.getElementById("gameModule").style.display = "block";
    document.getElementById("enterModule").style.display = "none";
    e.preventDefault();
    document.getElementById('enterForm').blur();
});

$("#chatForm").submit(function (e) {
    var message = $("#chatInput").val();
    $("#chatInput").val('');
    message = userName + ": " + message;
    // send chat message
    socket.emit("client_to_server_chat", {
        value: message
    });
    e.preventDefault();
    document.getElementById('chatForm').blur();
});

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var canvasMessage = '';

class Player {
    constructor() {
        this.userName = '';
        this.playerNumber = '';
    }
}
class Ball {
    constructor(color) {
        this.radius = 10;
        this.positionX = 0;
        this.positionY = 0;
        this.color = color;
    }
}
class Paddle {
    constructor(positionX, positionY, color) {
        this.height = 10;
        this.width = 65;
        this.positionX = positionX;
        this.positionY = positionY;
        this.color = color;
    }
}
var player = new Player();
var ball1 = new Ball('#AAAAAA');
var paddle1 = new Paddle(0, canvas.height - 10, '#0095DD'); //blue
var paddle2 = new Paddle(0, 0, '#DD4800'); //red
var paddle3 = new Paddle(0, canvas.height - 10, '#00AA00'); //green
var paddle4 = new Paddle(0, 0, '#FFABCE') //pink

//score
var scoreBlue = 0;
var scoreRed = 0;

//Control cursor keys
function keyDownHandler(e) {
    if (e.keyCode == 39) {
        socket.emit("rightKeyDown", {
            room: chosenRoom,
            value: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        socket.emit("leftKeyDown", {
            room: chosenRoom,
            value: player.playerNumber
        });
    }
}
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        socket.emit("rightKeyUp", {
            room: chosenRoom,
            value: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        socket.emit("leftKeyUp", {
            room: chosenRoom,
            value: player.playerNumber
        });
    }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//draw objects
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(paddle) {
    ctx.beginPath();
    ctx.rect(paddle.positionX, paddle.positionY, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "14px Orbitron";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("P1(Blue) & P3(Green): " + scoreBlue, 8, 25);
    ctx.fillStyle = "#DD4800";
    ctx.fillText("P2(Red) & P3(Pink): " + scoreRed, 8, 45);
}

function drawCanvasMessage() {
    if (canvasMessage === 'Start') {
        ctx.font = "120px Orbitron";
        ctx.fillStyle = "#DDDDDD";
        ctx.fillText(canvasMessage, 80, 300);
    } else if (canvasMessage === 'Pause') {
        ctx.font = "100px Orbitron";
        ctx.fillStyle = "#DDDDDD";
        ctx.fillText(canvasMessage, 80, 300);
    } else { //When Game is over
        ctx.font = "26px Orbitron";
        ctx.fillStyle = "#0095DD";
        ctx.fillText(canvasMessage, 25, 300);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("getCoordinates", {
        value: chosenRoom
    });
    socket.on('setCoordinates', function (data) {
        ball1.positionX = data.ballX;
        ball1.positionY = data.ballY;
        paddle1.positionX = data.paddleX;
        paddle2.positionX = data.paddleX2;
        paddle3.positionX = data.paddleX3;
        paddle4.positionX = data.paddleX4;
    });
    drawCanvasMessage();
    drawBall(ball1);
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    drawPaddle(paddle3);
    drawPaddle(paddle4);
    drawScore();
    requestAnimationFrame(draw);
}

//Get playerNumber
socket.on('setPlayerNumber', function (data) {
    player.playerNumber = data.value;
});

//Start Button
function btnStart() {
    socket.emit("getStart", {
        value: chosenRoom
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
socket.on('setStart', function (data) {
    scoreBlue = data.scoreBlue;
    scoreRed = data.scoreRed;
    document.getElementById("btnStart").disabled = "disabled";
    document.getElementById("btnPause").disabled = "";
    document.getElementById("btnReset").disabled = "";
    draw();
});

function btnPause() {
    socket.emit("getPause");
    canvasMessage = 'Pause';
    document.getElementById('btnPause').blur();
}
socket.on('setPause', function () {
    document.getElementById("btnPause").disabled = "disabled";
    document.getElementById("btnStart").disabled = "";
});

function btnReset() {
    socket.emit("getReset", {
        value: chosenRoom
    });
    canvasMessage = '';
    document.getElementById('btnReset').blur();
}
//Receive System message from server
socket.on('showSystemMessage', function (data) {
    $("#systemMessage").prepend("<div>" + data.value + "</div>");
});
socket.on('showCanvasMessage', function (data) {
    console.log(data.value);
    canvasMessage = data.value;
});
//score
socket.on('renewScore', function (data) {
    scoreBlue = data.scoreBlue;
    scoreRed = data.scoreRed;
});