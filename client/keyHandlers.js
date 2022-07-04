function keyDownHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyDown", {
            roomName: player.room,
            playerNumber: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyDown", {
            roomName: player.room,
            playerNumber: player.playerNumber
        });
    }
}
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyUp", {
            roomName: player.room,
            playerNumber: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyUp", {
            roomName: player.room,
            playerNumber: player.playerNumber
        });
    }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);