const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 65;
const SWIPE_SPACE_HEIGHT = 50;

class Player {
    // x: number. initial x-coordinate of the paddle
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
        this.name = name;
        this.calcSwitch = false;
        this.gameOverSwitch = false;
        this.scoreRenewSwitch = false;
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
        // pause button state
        this.isPauseOn = false;
        // room's game state
        this.isGameStarted = false;
    }
    calculate() {
        if (this.calcSwitch == true) {
            if (this.isBallTouchTheSideWall()) {
                this.balldx *= -1;
            }
            else if (this.isBallPassingUpperEdge()) {
                if ((this.isBallTouchPaddle(this.players.Player2)) || (this.isBallTouchPaddle(this.players.Player4))) {
                    this.ballReflectOnPaddle();
                }
                else {
                    this.scoreBlue += 1;
                    this.processAfterScore();
                }
            }
            else if (this.isBallPassingLowerEdge()) {
                if ((this.isBallTouchPaddle(this.players.Player1)) || (this.isBallTouchPaddle(this.players.Player3))) {
                    this.ballReflectOnPaddle();
                }
                else {
                    this.scoreRed += 1;
                    this.processAfterScore();
                }
            }

            this.ballX += this.balldx;
            this.ballY += this.balldy;

            // Key handling
            Object.keys(this.players).forEach(n => {
                if (this.players[n].isRightPressed && this.players[n].paddle.x < this.canvasWidth - this.players[n].paddle.width) {
                    this.players[n].paddle.x += 5;
                } else if (this.players[n].isLeftPressed && this.players[n].paddle.x > 0) {
                    this.players[n].paddle.x -= 5;
                }
            });

        }
    } // calcurate() END

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

    restrictPosXInCanvas (x ,paddle) {
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

    isBallTouchTheSideWall() {
        if (this.ballX + this.balldx > this.canvasWidth - this.ballRadius || this.ballX + this.balldx < this.ballRadius) return true;
        else return false;
    }

    isBallPassingUpperEdge() {
        if (this.ballY + this.balldy < this.ballRadius + SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallPassingLowerEdge() {
        if (this.ballY + this.balldy > this.canvasHeight - this.ballRadius - SWIPE_SPACE_HEIGHT) return true;
        else return false;
    }

    isBallTouchPaddle(player) {
        const paddle = player.paddle;
        if (this.ballX > paddle.x && this.ballX < paddle.x + paddle.width) return true;
        else return false;
    }

    // Judge if a team got 3 points. If so, game is over. 
    processAfterScore() {
        this.scoreRenewSwitch = true;
        if (this.scoreBlue == 3 || this.scoreRed == 3) {
            this.calcSwitch = false;
            this.ballX = 500; //ball goes out from the canvas
            this.gameOverSwitch = true;
        }
        else {
            this.ballX = 240;
            this.ballY = 270;
            this.balldy > 0 ? this.balldy = -2 : this.balldy = 2;
        }
    }

    ballReflectOnPaddle() {
        this.balldy *= -1;
        this.balldy > 0 ? this.balldy += 0.5 : this.balldy -= 0.5;
    }

    reset() {
        this.scoreBlue = 0;
        this.scoreRed = 0;
        this.ballX = 240;
        this.ballY = 270;
        this.balldy = -2;
        this.gameOverSwitch = false;
        this.calcSwitch = true;
        this.isPauseOn = false;
    }
}//Room
module.exports = Room;
