class Player {
    constructor(x) {
        this.isAvailable = true;
        this.isRightPressed = false;
        this.isLeftPressed = false;
        this.paddle = new Paddle(x);
    }
}

class Paddle {
    constructor(x) {
        this.x = x;
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
            'Player1': new Player(160),
            'Player2': new Player(160),
            'Player3': new Player(240),
            'Player4': new Player(240)
        }
    }
    calculate() {
        if (this.calcSwitch == true) {
            // if the ball hit the wall
            if (this.ballX + this.balldx > this.canvasWidth - this.ballRadius || this.ballX + this.balldx < this.ballRadius) {
                this.balldx *= -1;
            }
            // if the ball hit a paddle of P2/P4
            else if (this.ballY + this.balldy < this.ballRadius) {
                if ((this.ballX > this.players.Player2.paddle.x && this.ballX < this.players.Player2.paddle.x + this.players.Player2.paddle.width) ||
                    (this.ballX > this.players.Player4.paddle.x && this.ballX < this.players.Player4.paddle.x + this.players.Player4.paddle.width)) {
                    this.balldy *= -1;
                    this.balldy > 0 ? this.balldy += 0.5 : this.balldy -= 0.5;
                }
                else {
                    this.scoreBlue += 1;
                    this.scoreRenewSwitch = true;
                    if (this.scoreBlue === 3) {
                        this.calcSwitch = false;
                        this.ballX = 500; //ball goes out from the canvas
                        this.gameOverSwitch = true;
                    }
                    else {
                        this.ballX = 240; this.ballY = 270; this.balldy = 2;
                    }
                }
            }
            // if the ball hit a paddle of P1/P3
            else if (this.ballY + this.balldy > this.canvasHeight - this.ballRadius) {
                if ((this.ballX > this.players.Player1.paddle.x && this.ballX < this.players.Player1.paddle.x + this.players.Player1.paddle.width) ||
                    (this.ballX > this.players.Player3.paddle.x && this.ballX < this.players.Player3.paddle.x + this.players.Player3.paddle.width)) {
                    this.balldy *= -1;
                    this.balldy > 0 ? this.balldy += 0.5 : this.balldy -= 0.5;
                }
                else {
                    this.scoreRed += 1;
                    this.scoreRenewSwitch = true;
                    //io.sockets.emit("renewScore",{ scoreBlue:this.scoreBlue, scoreRed:this.scoreRed } );
                    if (this.scoreRed == 3) {
                        this.calcSwitch = false;
                        this.ballX = 500; //ball goes out from the canvas
                        this.gameOverSwitch = true;
                        // var systemMessage = 'Great! Player2(Red) Won!'
                        // io.to(this.name).emit("showSystemMessage",{value:systemMessage});
                    }
                    else {
                        this.ballX = 240; this.ballY = 270; this.balldy = -2;
                    }
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
