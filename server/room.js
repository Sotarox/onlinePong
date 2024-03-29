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
        this.judgeIsGoal();
    }

    // calculate paddle position based on key input. Key handling occurs in server.js
    calcNextPaddlePositions() {
        Object.keys(this.players).forEach(n => {
            if (this.players[n].isRightPressed && this.players[n].paddle.getLeftX() < CANVAS_WIDTH - this.players[n].paddle.width) {
                this.players[n].paddle.moveHorizontal(5);
            } else if (this.players[n].isLeftPressed && this.players[n].paddle.getLeftX() > 0) {
                this.players[n].paddle.moveHorizontal(-5);
            }
        });
    }

    calcNextBallPosition() {
        if (!this.isGameStarted || this.isGameOver) return;
        if (this.isBallHitSideWall()) this.ball.reflectHorizontal();
        if (this.isBallHitUpperPaddle(this.players.Player2) || this.isBallHitUpperPaddle(this.players.Player4) ||
            this.isBallHitLowerPaddle(this.players.Player1) || this.isBallHitLowerPaddle(this.players.Player3)) {
            this.ball.reflectVertical();
        }
        this.ball.move();
    }

    judgeIsGoal(){
        if (!this.isGameStarted || this.isGameOver) return;
        if (this.isBallPassingUpperEdge()) {
            this.scoreBlue += 1;
            this.processAfterScore();
        } else if (this.isBallPassingLowerEdge()) {
            this.scoreRed += 1;
            this.processAfterScore();
        }
    }

    onHandleTouch(playerNumber, posX, when) {
        let state = this.players[playerNumber].touchState;
        let paddle = this.players[playerNumber].paddle;
        switch (when) {
            case "on":
                state.isTouchOnPaddle = this.judgeIsTouchOnPaddle(posX, paddle);
                console.log("Room: On, isTouchOnPaddle:", state.isTouchOnPaddle)
                if (state.isTouchOnPaddle) {
                    paddle.moveToAbsoluteX(this.restrictPosXInCanvas(posX, paddle));
                }
                break;
            case "move":
                console.log("Room: Move, isTouchOnPaddle:", state.isTouchOnPaddle);
                if (state.isTouchOnPaddle) {
                    paddle.moveToAbsoluteX(this.restrictPosXInCanvas(posX, paddle));
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

    restrictPosXInCanvas(newPaddleLeftXpos, paddle) {
        if (newPaddleLeftXpos < 0) return 0;
        if (newPaddleLeftXpos > CANVAS_WIDTH - paddle.width)
            return CANVAS_WIDTH - paddle.width;
        return newPaddleLeftXpos;
    }

    // Y axis is currently not used for detection
    judgeIsTouchOnPaddle(touchX, paddle) {
        const marginWidth = this.touchHandle.marginPaddleWidth;
        return paddle.getLeftX() - marginWidth < touchX &&
            touchX < paddle.getLeftX() + paddle.width + marginWidth;
    }

    isBallHitSideWall() {
        if (this.ball.getLeftX() <= 0 ||
            this.ball.getRightX() >= CANVAS_WIDTH) return true;
        else return false;
    }

    isBallPassingUpperEdge() {
        if (this.ball.getBottomY() < SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallPassingLowerEdge() {
        if (this.ball.getTopY() > CANVAS_HEIGHT - SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallHitUpperPaddle(player) {
        const paddle = player.paddle;
        if (this.isBallIntersectPaddleOverXaxis(player) &&
            paddle.getTopY() <= this.ball.getTopY() && this.ball.getTopY() <= paddle.getBottomY()) return true;
        else return false;
    }

    isBallHitLowerPaddle(player) {
        const paddle = player.paddle;
        if (this.isBallIntersectPaddleOverXaxis(player) &&
            paddle.getTopY() <= this.ball.getBottomY() && this.ball.getBottomY() <= paddle.getBottomY()) return true;
        else return false;
    }

    isBallIntersectPaddleOverXaxis(player) {
        const paddle = player.paddle;
        if (paddle.getLeftX() <= this.ball.getLeftX() && this.ball.getLeftX() <= paddle.getRightX()) return true;
        else if (paddle.getLeftX() <= this.ball.getRightX() && this.ball.getRightX() <= paddle.getRightX()) return true;
        else return false;
    }

    // Judge if a team got 3 points. If so, turn on isGameOver. 
    processAfterScore() {
        if (this.scoreBlue >= 3 || this.scoreRed >= 3) this.isGameOver = true;
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
