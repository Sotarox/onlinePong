class Player {
    // x: number. initial x-coordinate of the paddle
    constructor(paddlePosX, paddlePosY) {
        this.isAvailable = true;
        this.isRightPressed = false;
        this.isLeftPressed = false;
        this.paddle = new Paddle(paddlePosX, paddlePosY);
        this.touchState = {
            posX: 0,
            posY: 0,
            when: "off", // on|move|off
            isTouchOnPaddle: false
        };
    }
}


class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.height = 10;
        this.width = 65;
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
        this.canvasWidth = 480;
        this.canvasHeight = 540;
        //ball
        this.ballRadius = 10;
        this.ballX = 240 //initial x-coordinate. canvasWidth/2;
        this.ballY = 270 //initial y-coordiante. canvasHeight/2;
        this.balldx = 1; // how many pixels to move by a rendering
        this.balldy = -1;
        //players
        this.players = {
            'Player1': new Player(160, 530),
            'Player2': new Player(160, 0),
            'Player3': new Player(240, 530),
            'Player4': new Player(240, 0)
        }
        // margin to detect if touch is on the paddle
        this.touchHandle = {
            marginPaddleWidth: 10,
            marginPaddleHeight: 10
        }
    }
    calculate() {
        // if (this.calcSwitch == true) {
        if (true) {
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

            // Touch handling
            Object.keys(this.players).forEach(n => {
                let { posX, posY, when, isTouchOnPaddle } = this.players[n].touchState;
                // console.log("Room: detected Touch", when, posX, posY, isTouchOnPaddle)
                switch (when) {
                    case "on":
                        isTouchOnPaddle = this.judgeIsTouchOnPaddle(posX, posY, this.players[n].paddle);
                        console.log("Room: on isTouchOnPaddle", isTouchOnPaddle)
                        if (isTouchOnPaddle) {
                            // const newPosX = this.restrictPaddlePositionInCanvas(posX);
                            // this.players[n].paddle.x = newPosX;
                            this.players[n].paddle.x = posX;
                        }
                        break;
                    case "move":
                        console.log("Room: on isTouchOnPaddle", isTouchOnPaddle)
                        if (isTouchOnPaddle) {
                            // const newPosX = this.restrictPaddlePositionInCanvas(posX);
                            // this.players[n].paddle.x = newPosX;
                            this.players[n].paddle.x = posX;
                        }
                        break;
                    case "off":
                        isTouchOnPaddle = false;
                        break;
                    default:
                        break;

                }
            });

        }
    }

    judgeIsTouchOnPaddle(touchX, touchY, paddle) {
        const marginWidth = this.touchHandle.marginPaddleWidth;
        const marginHeight = this.touchHandle.marginPaddleHeight;
        if (paddle.x - marginWidth < touchX &&
            touchX < paddle.x + paddle.width + marginWidth
            // &&
            // paddle.y - marginHeight < touchY &&
            // touchY < paddle.y + paddle.height + marginHeight
        ) {
            return true;
        } else return false;
    }

    isBallTouchTheSideWall() {
        if (this.ballX + this.balldx > this.canvasWidth - this.ballRadius || this.ballX + this.balldx < this.ballRadius) return true;
        else return false;
    }

    isBallPassingUpperEdge() {
        if (this.ballY + this.balldy < this.ballRadius) return true;
        else return false;
    }

    isBallPassingLowerEdge() {
        if (this.ballY + this.balldy > this.canvasHeight - this.ballRadius) return true;
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
    }
}//Room
module.exports = Room;
