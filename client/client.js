document.getElementById("gameDiv").style.display = "none";

$("#entryForm").submit((e) => {
    player.userName = $("#nameField").val() || "John Doe";
    SOCKET.emit("client_to_server_join", {
        clientName: player.userName,
        room: $("#roomsDropDownList").val()
    });
    document.getElementById("gameDiv").style.display = "block";
    document.getElementById("entryDiv").style.display = "none";
    e.preventDefault();
    document.getElementById('entryForm').blur();
});

$("#chatForm").submit((e) => {
    SOCKET.emit("pressChatSendButton", {
        message: `${player.userName}: ${$("#chatInputField").val()}`,
    });
    //delete input value in text field
    $("#chatInputField").val('');
    e.preventDefault();
    document.getElementById('chatForm').blur();
});

// This function is firstly called when connecting socket server
SOCKET.on('startRendering', () => {
    render();
});

function btnStart() {
    SOCKET.emit("pressStartButton");
    document.getElementById('btnStart').blur();
}
SOCKET.on('setStart', () => {
    document.getElementById("btnStart").disabled = "disabled";
    document.getElementById("btnReset").disabled = "";
    document.getElementById("btnPause").disabled = "";
});

function btnPause() {
    SOCKET.emit("pressPauseButton");
    document.getElementById('btnPause').blur();
}

function btnReset() {
    SOCKET.emit("pressResetButton");
    document.getElementById('btnReset').blur();
    document.getElementById("btnPause").disabled = "";
}
//Receive System message from server
SOCKET.on('showSystemMessage', (data) => {
    $("#systemMessageDiv").prepend("<div>" + data.value + "</div>");
});

SOCKET.on('gameOver', () => {
    document.getElementById("btnPause").disabled = "disabled";
});