class Player {
    constructor() {
        this.userName = '';
        this.playerNumber = '';
        this.room = '';
    }
}
class Ball {
    constructor(color) {
        this.radius = 10;
        this.positionX = 0;
        this.positionY = 0;
        this.color = color;
    }
}
class Paddle {
    constructor(positionX, positionY, color) {
        this.height = 10;
        this.width = 65;
        this.positionX = positionX;
        this.positionY = positionY;
        this.color = color;
    }
}