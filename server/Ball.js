class Ball {
    constructor() {
        this.radius = 10;
        this.x = 240 //center of circle. initial x-coordinate == canvasWidth/2;
        this.y = 270 //center of circle. initial y-coordiante == canvasHeight/2;
        this.dx = 1; // how many pixels to move by a rendering
        this.dy = -1;
        this.height = this.radius * 2;
        this.width = this.radius * 2;
    }
    move() {
        this.x += this.dx;
        this.y += this.dy;
    };
    // Called when a ball hit on the sidewall
    reflectHorizontal() {
        this.dx *= -1;
    }
    // Called when a ball hit on a paddle
    reflectVertical() {
        this.dy *= -1;
        this.dy > 0 ? this.dy += 0.5 : this.dy -= 0.5;
    }
    reset() {
        this.x = 240;
        this.y = 270;
        this.dy > 0 ? this.dy = 2 : this.dy = -2;
    }
    getLeftX(){
        return this.x - this.radius;
    }
    getRightX(){
        return this.x + this.radius;
    }
    getTopY(){
        return this.y - this.radius;
    }
    getBottomY(){
        return this.y + this.radius;
    }
}
module.exports = Ball;