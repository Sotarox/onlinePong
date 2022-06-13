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

function drawScore() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = "14px Orbitron";
    ctx.fillStyle = COLORS.PLAYER_BLUE;
    ctx.fillText("P1(Blue) & P3(Green): " + scoreBlue, 8, 25);
    ctx.fillStyle = COLORS.PLAYER_RED;
    ctx.fillText("P2(Red) & P3(Pink): " + scoreRed, 8, 45);
}

function drawCanvasMessage() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.fillStyle = COLORS.TEXT_GRAY;
    if (canvasMessage === 'Start') {
        ctx.font = "120px Orbitron";
        ctx.fillText(canvasMessage, 80, 300);
    } else if (canvasMessage === 'Pause') {
        ctx.font = "100px Orbitron";
        ctx.fillText(canvasMessage, 80, 300);
    } else { //When Game is over
        ctx.font = "26px Orbitron";
        ctx.fillText(canvasMessage, 25, 300);
    }
}

function render() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SOCKET.emit("getCoordinates", {
        value: chosenRoom
    });
    SOCKET.on('setCoordinates', function (data) {
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
    // Render animation repeatedly by 60fps
    requestAnimationFrame(render);
}