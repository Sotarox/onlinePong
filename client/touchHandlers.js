var isFingerOnPaddle = false;
const marginWidth = 10; 
const marginHeight = 10;
const ongoingTouches = [];

function startup() {
    const el = document.getElementById('canvas');
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchCancel);
    el.addEventListener('touchmove', handleTouchMove);
    console.log('Touch detection client side Initialized.');
}
document.addEventListener("DOMContentLoaded", startup);

// Externalize this func to server side??
function renewPaddleX(x) {
    if (isFingerOnPaddle === false) return;
    console.log("renewPaddleX argument:", x);
    // Restrict x position so that the paddle fit in the canvas
    if (x > canvasWidth - paddleWidth) {
        x = canvasWidth - paddleWidth;
    } else if (x < 0) {
        x = 0;
    }
    paddleX = x;
}

function judgeIfFingerOnPaddle(touchX, touchY) {
    if (paddleX - marginWidth < touchX &&
        touchX < paddleX + paddleWidth + marginWidth &&
        paddleY - marginHeight < touchY &&
        touchY < paddleY + paddleHeight + marginHeight
    ) {
        return true;
    } else return false;
}

function handleTouchStart(evt) {
    evt.preventDefault();
    console.log('touchstart.');
    const el = document.getElementById('canvas');
    const ctx = el.getContext('2d');
    const touches = evt.changedTouches;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
        // Convert absolute coordinate to relative coordinate on the canvas
        const touchX = touches[i].pageX - rect.left;
        const touchY = touches[i].pageY - rect.top;
        
        // paint touched point
        console.log(`touchstart: ${i}.`);
        // ongoingTouches.push(copyTouch(touches[i]));
        ongoingTouches.push({identifier: touches[i].identifier, pageX: touchX, pageY: touchY});
        const color = colorForTouch(touches[i]);
        console.log(`color of touch with id ${touches[i].identifier} = ${color}`);
        ctx.beginPath();
        ctx.arc(touchX, touchY, 4, 0, 2 * Math.PI, false);  // a circle at the start
        console.log(touchX, touchY);
        ctx.fillStyle = color;
        ctx.fill();

        // isFingerOnPaddle = judgeIfFingerOnPaddle(touches[i].pageX, touches[i].pageY);
        // renewPaddleX(touches[i].pageX);
        SOCKET.emit("touch", { roomName: player.room, posX: touchX, posY: touchY, when:"on" });
    }
}

function handleTouchMove(evt) {
    evt.preventDefault();
    const el = document.getElementById('canvas');
    const ctx = el.getContext('2d');
    const touches = evt.changedTouches;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
        const touchX = touches[i].pageX - rect.left;
        const touchY = touches[i].pageY - rect.top;

        const color = colorForTouch(touches[i]);
        const idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            console.log(`continuing touch ${idx}`);
            ctx.beginPath();
            console.log(`ctx.moveTo( ${ongoingTouches[idx].pageX}, ${ongoingTouches[idx].pageY} );`);
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            console.log(`ctx.lineTo( ${touches[i].pageX}, ${touches[i].pageY} );`);
            // ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineTo(touchX, touchY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();
            // ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
            ongoingTouches.splice(idx, 1, copyTouch({identifier: touches[i].identifier, pageX: touchX, pageY: touchY}));  // swap in the new touch record

            // renewPaddleX(touches[i].pageX);
            SOCKET.emit("touch", { roomName: player.room, posX: touchX, posY: touchY, when:"move" });
        } else {
            console.log('can\'t figure out which touch to continue');
        }
    }
}

function handleTouchEnd(evt) {
    evt.preventDefault();
    console.log("touchend");
    const el = document.getElementById('canvas');
    const ctx = el.getContext('2d');
    const touches = evt.changedTouches;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
        const touchX = touches[i].pageX - rect.left;
        const touchY = touches[i].pageY - rect.top;
        
        const color = colorForTouch(touches[i]);
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touchX, touchY);
            ctx.fillRect(touchX - 4, touchY - 4, 8, 8);  // and a square at the end
            ongoingTouches.splice(idx, 1);  // remove it; we're done

            // isFingerOnPaddle = false;
            
            // somehow I commented out the following line. TODO: investigate why 
            // renewPaddleX(touches[i].pageX);
            SOCKET.emit("touch", { roomName: player.room, posX: touchX, posY: touchY, when:"off" });
        } else {
            console.log('can\'t figure out which touch to end');
        }
    }
}

function handleTouchCancel(evt) {
    evt.preventDefault();
    console.log('touchcancel.');
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
}

function colorForTouch(touch) {
    let r = touch.identifier % 16;
    let g = Math.floor(touch.identifier / 3) % 16;
    let b = Math.floor(touch.identifier / 7) % 16;
    r = r.toString(16); // make it a hex digit
    g = g.toString(16); // make it a hex digit
    b = b.toString(16); // make it a hex digit
    const color = "#" + r + g + b;
    return color;
}
function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
}
function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        const id = ongoingTouches[i].identifier;
        if (id == idToFind) return i;
    }
    return -1;    // not found
}