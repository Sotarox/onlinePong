function keyDownHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyDown", {
            room: chosenRoom,
            value: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyDown", {
            room: chosenRoom,
            value: player.playerNumber
        });
    }
}
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyUp", {
            room: chosenRoom,
            value: player.playerNumber
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyUp", {
            room: chosenRoom,
            value: player.playerNumber
        });
    }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);