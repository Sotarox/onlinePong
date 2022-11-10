function keyDownHandler(e) {
    let key;
    if (e.keyCode == 37) key = "left";
    else if ((e.keyCode == 39)) key = "right"
    if (key){
        SOCKET.emit("keyInput", {
            key: key,
            when: "down",
            roomName: player.room,
        });
    }
}

function keyUpHandler(e) {
    let key;
    if (e.keyCode == 37) key = "left";
    else if ((e.keyCode == 39)) key = "right"
    if (key){
        SOCKET.emit("keyInput", {
            key: key,
            when: "up",
            roomName: player.room,
        });
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);