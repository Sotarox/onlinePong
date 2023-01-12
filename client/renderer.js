var scoreBlue = 0;
var scoreRed = 0;

function drawBall(ball) {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.beginPath();
    ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(paddle) {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.beginPath();
    ctx.rect(paddle.positionX, paddle.positionY, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawGoalLines() {
    const ctx = document.getElementById('canvas').getContext('2d');
    // Lower line (P1 & P3)
    ctx.beginPath();
    ctx.rect(0, 0, 360, 50);
    ctx.fillStyle = COLORS.LINE_GRAY;
    ctx.fill();
    ctx.closePath();
    // Upper line (P2 & P4)
    ctx.beginPath();
    ctx.rect(0, 430, 360, 480);
    ctx.fillStyle = COLORS.LINE_GRAY;
    ctx.fill();
    ctx.closePath();
}

function drawScore(scoreBlue, scoreRed) {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = "14px Orbitron";
    ctx.fillStyle = COLORS.PLAYER_BLUE;
    ctx.fillText("P1(Blue) & P3(Green): " + scoreBlue, 8, 460);
    ctx.fillStyle = COLORS.PLAYER_RED;
    ctx.fillText("P2(Red) & P3(Pink): " + scoreRed, 8, 25);
}

function drawCanvasMessage() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.fillStyle = COLORS.TEXT_GRAY;
    if (canvasMessage === 'Start') {
        ctx.font = "80px Orbitron";
        ctx.fillText(canvasMessage, 80, 260);
    } else if (canvasMessage === 'Pause') {
        ctx.font = "60px Orbitron";
        ctx.fillText(canvasMessage, 80, 260);
    } else { //When Game is over
        ctx.font = "20px Orbitron";
        ctx.fillText(canvasMessage, 20, 260);
    }
}

function render() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SOCKET.emit("getCoordinates", {
        roomName: player.room
    });
    SOCKET.on('setCoordinates', function (data) {
        ball1.positionX = data.ballX;
        ball1.positionY = data.ballY;
        paddle1.positionX = data.player1PaddleX;
        paddle1.positionY = data.player1PaddleY;
        paddle2.positionX = data.player2PaddleX;
        paddle2.positionY = data.player2PaddleY;
        paddle3.positionX = data.player3PaddleX;
        paddle3.positionY = data.player3PaddleY;
        paddle4.positionX = data.player4PaddleX;
        paddle4.positionY = data.player4PaddleY;
        scoreBlue = data.scoreBlue;
        scoreRed = data.scoreRed;
    });
    drawCanvasMessage();
    drawGoalLines();
    drawBall(ball1);
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    drawPaddle(paddle3);
    drawPaddle(paddle4);
    drawScore(scoreBlue, scoreRed);
    // Render animation repeatedly by 60fps
    requestAnimationFrame(render);
}