// TODO: set initial height and width from Global variables
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.height = 10; //PADDLE_HEIGHT;
        this.width = 65; //PADDLE_WIDTH;
    }
}
module.exports = Paddle;