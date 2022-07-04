class Player{
    constructor(){
        this.isAvailable = true;
        // TODO research what is the purpose to have soketId
        this.socketId = "";
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
        //paddle1
        this.paddleX = 160;
        this.paddleHeight = 10;
        this.paddleWidth = 65;
        this.rightPressed1 = false;
        this.leftPressed1 = false;
        //paddle2
        this.paddleX2 = 160;
        this.paddleHeight2 = 10;
        this.paddleWidth2 = 65;
        this.rightPressed2 = false;
        this.leftPressed2 = false;
        //paddle3
        this.paddleX3 = 240;
        this.paddleHeight3 = 10;
        this.paddleWidth3 = 65;
        this.rightPressed3 = false;
        this.leftPressed3 = false;
        //paddle4
        this.paddleX4 = 240;
        this.paddleHeight4 = 10;
        this.paddleWidth4 = 65;
        this.rightPressed4 = false;
        this.leftPressed4 = false;
        //players
        this.players = {
            Player1: new Player(),
            Player2: new Player(),
            Player3: new Player(),
            Player4: new Player()
        }
    }
    calculate() {
        if (this.calcSwitch == true) {
            //ball
            if (this.ballX + this.balldx > this.canvasWidth - this.ballRadius || this.ballX + this.balldx < this.ballRadius) {
                this.balldx = -this.balldx;
            }
            else if (this.ballY + this.balldy < this.ballRadius) {
                if ((this.ballX > this.paddleX2 && this.ballX < this.paddleX2 + this.paddleWidth2) ||
                    (this.ballX > this.paddleX4 && this.ballX < this.paddleX4 + this.paddleWidth4)) {
                    this.balldy = -this.balldy;
                    if (this.balldy > 0) {
                        this.balldy += 0.5;
                    } else {
                        this.balldy -= 0.5;
                    }
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
            else if (this.ballY + this.balldy > this.canvasHeight - this.ballRadius) {//unten blue
                if ((this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) ||
                    (this.ballX > this.paddleX3 && this.ballX < this.paddleX3 + this.paddleWidth3)) {
                    this.balldy = -this.balldy;
                    if (this.balldy > 0) {
                        this.balldy += 0.5;
                    } else {
                        this.balldy -= 0.5;
                    }
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

            // paddle move by players input
            if (this.rightPressed1 && this.paddleX < this.canvasWidth - this.paddleWidth) {
                this.paddleX += 5;
            }
            if (this.leftPressed1 && this.paddleX > 0) {
                this.paddleX -= 5;
            }
            if (this.rightPressed2 && this.paddleX2 < this.canvasWidth - this.paddleWidth2) {
                this.paddleX2 += 5;
            }
            if (this.leftPressed2 && this.paddleX2 > 0) {
                this.paddleX2 -= 5;
            }
            if (this.rightPressed3 && this.paddleX3 < this.canvasWidth - this.paddleWidth3) {
                this.paddleX3 += 5;
            }
            if (this.leftPressed3 && this.paddleX3 > 0) {
                this.paddleX3 -= 5;
            }
            if (this.rightPressed4 && this.paddleX4 < this.canvasWidth - this.paddleWidth4) {
                this.paddleX4 += 5;
            }
            if (this.leftPressed4 && this.paddleX4 > 0) {
                this.paddleX4 -= 5;
            }
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
