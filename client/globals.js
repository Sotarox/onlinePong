const SOCKET = io();

// Classes
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

// Fixed values
const COLORS = {
    PLAYER_BLUE: '#0095DD',
    PLAYER_RED: '#DD4800',
    PLAYER_GREEN: '#00AA00',
    PLAYER_PINK: '#FFABCE',
    BALL_GRAY: '#AAAAAA',
    TEXT_GRAY: '#DDDDDD',
    LINE_GRAY: '#DDDDDD'
}

// Variables that overwritten by multiple js files
var ball1 = new Ball(COLORS.BALL_GRAY);
var paddle1 = new Paddle(0, document.getElementById("canvas").height - 10, COLORS.PLAYER_BLUE);
var paddle2 = new Paddle(0, 0, COLORS.PLAYER_RED);
var paddle3 = new Paddle(0, document.getElementById("canvas").height - 10, COLORS.PLAYER_GREEN);
var paddle4 = new Paddle(0, 0, COLORS.PLAYER_PINK)
var canvasMessage = '';
var scoreBlue = 0;
var scoreRed = 0;
var isPauseOn = false;