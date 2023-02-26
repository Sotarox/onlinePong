// TODO: set initial height and width from Global variables
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.height = 10; //PADDLE_HEIGHT;
        this.width = 65; //PADDLE_WIDTH;
    }
    getBottomY(){
        return this.y + this.height;
    }
    getRightX(){
        return this.x + this.width;
    }
}
module.exports = Paddle;