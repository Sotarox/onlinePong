const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 65;
const SWIPE_SPACE_HEIGHT = 50;

class Player {
    // paddlePosX: number. initial x-coordinate of the paddle
    constructor(paddlePosX, paddlePosY) {
        this.isAvailable = true;
        this.isRightPressed = false;
        this.isLeftPressed = false;
        this.paddle = new Paddle(paddlePosX, paddlePosY);
        this.touchState = {
            isTouchOnPaddle: false
        }
    }
}

class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.height = PADDLE_HEIGHT;
        this.width = PADDLE_WIDTH;
    }
}

class Room {
    constructor(name) {
        // TODO: name is used only in a server.js's gameStateWatcher. Research and delete this var if possible.
        this.name = name;
        this.scoreBlue = 0;
        this.scoreRed = 0;
        //canvas & score
        this.canvasWidth = 360;
        this.canvasHeight = 480;
        //ball
        this.ballRadius = 10;
        this.ballX = 240 //initial x-coordinate. canvasWidth/2;
        this.ballY = 270 //initial y-coordiante. canvasHeight/2;
        this.balldx = 1; // how many pixels to move by a rendering
        this.balldy = -1;
        this.ballHeight = this.ballRadius * 2;
        //players
        this.players = {
            'Player1': new Player(90, this.canvasHeight - PADDLE_HEIGHT - SWIPE_SPACE_HEIGHT),
            'Player2': new Player(90, SWIPE_SPACE_HEIGHT),
            'Player3': new Player(205, this.canvasHeight - PADDLE_HEIGHT - SWIPE_SPACE_HEIGHT),
            'Player4': new Player(205, SWIPE_SPACE_HEIGHT)
        }
        // margin to detect if touch is on the paddle
        this.touchHandle = {
            marginPaddleWidth: 10,
            marginPaddleHeight: 10
        }
        // game processing state
        this.isGameStarted = false;
        this.isGameOver = false;
        this.isPauseOn = false;
        // message in canvas e.g. Start, Pause
        this.canvasMessage = "";
    }
    calculate() {
        if (this.isPauseOn) return;
        this.calcNextPaddlePositions();
        this.calcNextBallPosition();
    }

    // calculate paddle position based on key input. Key handling occurs in server.js
    calcNextPaddlePositions() {
        Object.keys(this.players).forEach(n => {
            if (this.players[n].isRightPressed && this.players[n].paddle.x < this.canvasWidth - this.players[n].paddle.width) {
                this.players[n].paddle.x += 5;
            } else if (this.players[n].isLeftPressed && this.players[n].paddle.x > 0) {
                this.players[n].paddle.x -= 5;
            }
        });
    }

    calcNextBallPosition() {
        if (!this.isGameStarted || this.isGameOver) return;
        if (this.isBallHitSideWall()) this.balldx *= -1;

        // if ball hit paddle
        if (this.isBallHitUpperPaddle(this.players.Player2) || this.isBallHitUpperPaddle(this.players.Player4) ||
            this.isBallHitLowerPaddle(this.players.Player1) || this.isBallHitLowerPaddle(this.players.Player3)) {
            this.reflectBallOnPaddle();
        } else if (this.isBallPassingUpperEdge()) {
            this.scoreBlue += 1;
            this.processAfterScore();
        } else if (this.isBallPassingLowerEdge()) {
            this.scoreRed += 1;
            this.processAfterScore();
        }

        // finally block. ball moves always a little bit
        this.ballX += this.balldx;
        this.ballY += this.balldy;
    }

    onHandleTouch(playerNumber, posX, when) {
        let state = this.players[playerNumber].touchState;
        let paddle = this.players[playerNumber].paddle;
        switch (when) {
            case "on":
                state.isTouchOnPaddle = this.judgeIsTouchOnPaddle(posX, paddle);
                console.log("Room: On, isTouchOnPaddle:", state.isTouchOnPaddle)
                if (state.isTouchOnPaddle) {
                    paddle.x = this.restrictPosXInCanvas(posX, paddle);
                }
                break;
            case "move":
                console.log("Room: Move, isTouchOnPaddle:", state.isTouchOnPaddle);
                if (state.isTouchOnPaddle) {
                    paddle.x = this.restrictPosXInCanvas(posX, paddle);
                }
                break;
            case "off":
                console.log("Room: Off")
                state.isTouchOnPaddle = false;
                break;
            default:
                break;
        }
    }

    restrictPosXInCanvas(x, paddle) {
        if (x < 0) return 0;
        if (x > this.canvasWidth - paddle.width)
            return this.canvasWidth - paddle.width;
        return x;
    }

    // Y axis is currently not used for detection
    judgeIsTouchOnPaddle(touchX, paddle) {
        const marginWidth = this.touchHandle.marginPaddleWidth;
        return paddle.x - marginWidth < touchX &&
            touchX < paddle.x + paddle.width + marginWidth;
    }

    isBallHitSideWall() {
        if (this.ballX + this.balldx > this.canvasWidth - this.ballRadius || this.ballX + this.balldx < this.ballRadius) return true;
        else return false;
    }

    isBallPassingUpperEdge() {
        if (this.ballY + this.balldy < SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallPassingLowerEdge() {
        if (this.ballY + this.balldy > this.canvasHeight - this.ballRadius - SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallHitUpperPaddle(player) {
        const paddle = player.paddle;
        if (this.ballX > paddle.x && this.ballX < paddle.x + paddle.width &&
            paddle.y < this.ballY && this.ballY < paddle.y + paddle.height) return true;
        else return false;
    }

    isBallHitLowerPaddle(player) {
        const paddle = player.paddle;
        if (this.ballX > paddle.x && this.ballX < paddle.x + paddle.width &&
            paddle.y < this.ballY + this.ballHeight && paddle.y + paddle.height < this.ballY + this.ballHeight) return true;
        else return false;
    }

    // Judge if a team got 3 points. If so, turn on isGameOver. 
    processAfterScore() {
        if (this.scoreBlue == 3 || this.scoreRed == 3) {
            this.isGameOver = true;
        }
        else {
            this.ballX = 240;
            this.ballY = 270;
            this.balldy > 0 ? this.balldy = -2 : this.balldy = 2;
        }
    }

    reflectBallOnPaddle() {
        this.balldy *= -1;
        this.balldy > 0 ? this.balldy += 0.5 : this.balldy -= 0.5;
    }

    reset() {
        this.scoreBlue = 0;
        this.scoreRed = 0;
        this.ballX = 240;
        this.ballY = 270;
        this.balldy = -2;
        this.isGameOver = false;
        this.isPauseOn = false;
    }
} //Room
module.exports = Room;
