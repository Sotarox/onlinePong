const Paddle = require("./Paddle.js");

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
module.exports = Player;