const Ball = require("./Ball.js");
const Player = require("./Player.js");

const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 65;
const SWIPE_SPACE_HEIGHT = 50;
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 480;

class Room {
    constructor(name) {
        // TODO: name is used only in a server.js's gameStateWatcher. Research and delete this var if possible.
        this.name = name;
        this.scoreBlue = 0;
        this.scoreRed = 0;
        //ball
        this.ball = new Ball();
        //players
        this.players = {
            'Player1': new Player(90, CANVAS_HEIGHT - PADDLE_HEIGHT - SWIPE_SPACE_HEIGHT),
            'Player2': new Player(90, SWIPE_SPACE_HEIGHT),
            'Player3': new Player(205, CANVAS_HEIGHT - PADDLE_HEIGHT - SWIPE_SPACE_HEIGHT),
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
            if (this.players[n].isRightPressed && this.players[n].paddle.x < CANVAS_WIDTH - this.players[n].paddle.width) {
                this.players[n].paddle.x += 5;
            } else if (this.players[n].isLeftPressed && this.players[n].paddle.x > 0) {
                this.players[n].paddle.x -= 5;
            }
        });
    }

    calcNextBallPosition() {
        if (!this.isGameStarted || this.isGameOver) return;
        if (this.isBallHitSideWall()) this.ball.reflectHorizontal();

        // if ball hit paddle
        if (this.isBallHitUpperPaddle(this.players.Player2) || this.isBallHitUpperPaddle(this.players.Player4) ||
            this.isBallHitLowerPaddle(this.players.Player1) || this.isBallHitLowerPaddle(this.players.Player3)) {
            // this.reflectBallOnPaddle();
            this.ball.reflectVertical();
        } else if (this.isBallPassingUpperEdge()) {
            this.scoreBlue += 1;
            this.processAfterScore();
        } else if (this.isBallPassingLowerEdge()) {
            this.scoreRed += 1;
            this.processAfterScore();
        }

        this.ball.move();
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
        if (x > CANVAS_WIDTH - paddle.width)
            return CANVAS_WIDTH - paddle.width;
        return x;
    }

    // Y axis is currently not used for detection
    judgeIsTouchOnPaddle(touchX, paddle) {
        const marginWidth = this.touchHandle.marginPaddleWidth;
        return paddle.x - marginWidth < touchX &&
            touchX < paddle.x + paddle.width + marginWidth;
    }

    isBallHitSideWall() {
        if (this.ball.x + this.ball.dx > CANVAS_WIDTH - this.ball.radius || this.ball.x + this.ball.dx < this.ball.radius) return true;
        else return false;
    }

    isBallPassingUpperEdge() {
        if (this.ball.y + this.ball.dy < SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallPassingLowerEdge() {
        if (this.ball.y + this.ball.dy > CANVAS_HEIGHT - this.ball.radius - SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallHitUpperPaddle(player) {
        const paddle = player.paddle;
        if (this.ball.x > paddle.x && this.ball.x < paddle.x + paddle.width &&
            paddle.y < this.ball.y && this.ball.y < paddle.y + paddle.height) return true;
        else return false;
    }

    isBallHitLowerPaddle(player) {
        const paddle = player.paddle;
        if (this.ball.x > paddle.x && this.ball.x < paddle.x + paddle.width &&
            paddle.y < this.ball.y + this.ball.height && paddle.y + paddle.height < this.ball.y + this.ball.height) return true;
        else return false;
    }

    // Judge if a team got 3 points. If so, turn on isGameOver. 
    processAfterScore() {
        if (this.scoreBlue === 3 || this.scoreRed === 3) this.isGameOver = true;
        else this.ball.reset();
    }

    reset() {
        this.scoreBlue = 0;
        this.scoreRed = 0;
        this.ball.reset();
        this.isGameOver = false;
        this.isPauseOn = false;
    }
}
module.exports = Room;
