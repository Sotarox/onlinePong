class Room{
   constructor(name){
     this.name = name;
     this.calcSwitch = false;
     this.gameOverSwitch = false;
     this.scoreRenewSwitch = false;
     this.scoreBlue = 0;
     this.scoreRed = 0;
     //canvas & score
     this.canvasWidth = 480;
     this.canvasHeight = 540; //old ver:620
     //ball
     this.ballRadius = 10;
     this.x = 240 //canvasWidth/2;
     this.y = 270 //canvasHeight/2;
     this.dx = 1;
     this.dy = -1;
     //paddle1
     this.paddleHeight = 10;
     this.paddleWidth = 65;
     this.paddleX = 160;
     this.rightPressed1 = false;
     this.leftPressed1 = false;
     //paddle2
     this.paddleHeight2 = 10;
     this.paddleWidth2 = 65;
     this.paddleX2 = 160;
     this.rightPressed2 = false;
     this.leftPressed2 = false;
     //paddle3
     this.paddleHeight3 = 10;
     this.paddleWidth3 = 65;
     this.paddleX3 = 240;
     this.rightPressed3 = false;
     this.leftPressed3 = false;
     //paddle4
     this.paddleHeight4 = 10;
     this.paddleWidth4 = 65;
     this.paddleX4 = 240;
     this.rightPressed4 = false;
     this.leftPressed4 = false;
  }
  calculate() {
      if(this.calcSwitch==true){
          //ball
          if(this.x + this.dx > this.canvasWidth-this.ballRadius || this.x + this.dx < this.ballRadius) {
            this.dx = -this.dx;
          }
          else if(this.y + this.dy < this.ballRadius) {
              if((this.x > this.paddleX2 && this.x < this.paddleX2 + this.paddleWidth2)||
                 (this.x > this.paddleX4 && this.x < this.paddleX4 + this.paddleWidth4)) {
                this.dy = -this.dy;
                  if(this.dy>0){
                    this.dy += 0.5;
                  }else{
                    this.dy -= 0.5;
                  }
              }
              else{
                  this.scoreBlue += 1;
                  this.scoreRenewSwitch = true;
                  if(this.scoreBlue===3){
                      this.calcSwitch=false;
                      this.x=500; //ball goes out from the canvas
                      this.gameOverSwitch = true;
                  }
                  else{
                      this.x=240;this.y=270;this.dy=2;
                  }
              }
          }
          else if(this.y + this.dy > this.canvasHeight-this.ballRadius) {//unten blue
              if((this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth)||
                 (this.x > this.paddleX3 && this.x < this.paddleX3 + this.paddleWidth3)) {
              this.dy = -this.dy;
                  if(this.dy>0){
                      this.dy += 0.5;
                  }else{
                      this.dy -= 0.5;
                  }
              }
              else{
                  this.scoreRed += 1;
                  this.scoreRenewSwitch = true;
                  //io.sockets.emit("renewScore",{ scoreBlue:this.scoreBlue, scoreRed:this.scoreRed } );
                  if(this.scoreRed==3){
                      this.calcSwitch=false;
                      this.x=500; //ball goes out from the canvas
                      this.gameOverSwitch = true;
                      // var systemMessage = 'Great! Player2(Red) Won!'
                      // io.to(this.name).emit("showSystemMessage",{value:systemMessage});
                  }
                  else{
                      this.x=240;this.y=270;this.dy=-2;
                  }
              }
          }
          this.x += this.dx;
          this.y += this.dy;

          //paddle move from players
          if(this.rightPressed1 && this.paddleX < this.canvasWidth-this.paddleWidth) {
              this.paddleX += 5;
          }
          if(this.leftPressed1 && this.paddleX > 0) {
              this.paddleX -= 5;
          }
          if(this.rightPressed2 && this.paddleX2 < this.canvasWidth-this.paddleWidth2) {
              this.paddleX2 += 5;
          }
          if(this.leftPressed2 && this.paddleX2 > 0) {
              this.paddleX2 -= 5;
          }
          if(this.rightPressed3 && this.paddleX3 < this.canvasWidth-this.paddleWidth3) {
              this.paddleX3 += 5;
          }
          if(this.leftPressed3 && this.paddleX3 > 0) {
              this.paddleX3 -= 5;
          }
          if(this.rightPressed4 && this.paddleX4 < this.canvasWidth-this.paddleWidth4) {
              this.paddleX4 += 5;
          }
          if(this.leftPressed4 && this.paddleX4 > 0) {
              this.paddleX4 -= 5;
          }
      }
  }
}//Room
module.exports = Room;
