function keyDownHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyDown", {
            room: player.room,
            value: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyDown", {
            room: player.room,
            value: player.playerNumber
        });
    }
}
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyUp", {
            room: player.room,
            value: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyUp", {
            room: player.room,
            value: player.playerNumber
        });
    }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);