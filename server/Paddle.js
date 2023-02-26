// TODO: set initial height and width from Global variables
class Paddle {
    constructor(x, y) {
        this.x = x; // upper left corner(x,y) of rectangle  
        this.y = y;
        this.height = 10; //PADDLE_HEIGHT;
        this.width = 65; //PADDLE_WIDTH;
    }
    getRightX(){
        return this.x + this.width;
    }
    getBottomY(){
        return this.y + this.height;
    }
}
module.exports = Paddle;