function keyDownHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyDown", {
            roomName: player.room,
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyDown", {
            roomName: player.room,
        });
    }
}
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        SOCKET.emit("rightKeyUp", {
            roomName: player.room,
        });
    } else if (e.keyCode == 37) {
        SOCKET.emit("leftKeyUp", {
            roomName: player.room,
        });
    }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);