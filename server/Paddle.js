// TODO: set initial height and width from Global variables
class Paddle {
    constructor(x, y) {
        this.x = x; // upper left corner(x,y) of rectangle  
        this.y = y;
        this.height = 10; //PADDLE_HEIGHT;
        this.width = 65; //PADDLE_WIDTH;
    }
    moveHorizontal(n){
        this.x += n;
    }
    moveToAbsoluteX(n){
        this.x = n;
    }
    getLeftX(){
        return this.x;
    }
    getRightX(){
        return this.x + this.width;
    }
    getTopY(){
        return this.y;
    }
    getBottomY(){
        return this.y + this.height;
    }
}
module.exports = Paddle;