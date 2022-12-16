var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");

var _width = 0;
var _height = 0;

var setCanvasDim = function(w, h) {
    canvasElement.width = w;
    canvasElement.height = h;
    _width = w;
    _height = h;
}

setCanvasDim(600, 600);



// Color functions
var hsl = function(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

var rgb = function(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}



// Math functions/aliases
var abs = Math.abs;

var scale = function(n, minFrom, maxFrom, minTo, maxTo) {
    return ((n / (maxFrom - minFrom)) * (maxTo - minTo)) + minTo;
};



// Mouse variables
var mouseX = null;
var mouseY = null;
var startDragX = null;
var startDragY = null;
var mouseDown = false;


// Mouse Events

canvasElement.onmousedown = function(event) {
    if(event.buttons == 1) {
        if(!mouseDown) {
            startDragX = mouseX;
            startDragY = mouseY;
        }
        mouseDown = true;
    }
};


// Based on mouse coordinates, calculate the frame for the new image and start it
canvasElement.onmouseup = function() {
    if(!mouseDown) {
        return;
    }
    mouseDown = false;
    let newFrame;
    if(mouseX == startDragX && mouseY == startDragY) {
        if(keys["Control"]) {
            let currFrame = currImg.frame;
            newFrame = new Frame(
                currFrame.toComplexCoords(mouseX, mouseY),
                currFrame.reWidth,
                currFrame.imHeight
            );
        }
        else {
            let zoomFactor = toolbar.clickZoomFactor;
            let xOffset = mouseX - (_width / 2);
            let yOffset = mouseY - (_height / 2);
            let newReWidth, newImHeight;
            if(keys["Shift"]) {
                newReWidth = currImg.frame.reWidth * zoomFactor;
                newImHeight = currImg.frame.imHeight * zoomFactor;
            }
            else {
                newReWidth = currImg.frame.reWidth / zoomFactor;
                newImHeight = currImg.frame.imHeight / zoomFactor;
            }
            let newReIter = newReWidth / _width;
            let newImIter = newImHeight / _height;
            let focus = currImg.frame.toComplexCoords(mouseX, mouseY);
            newFrame = new Frame(
                Complex(
                    focus.re - (xOffset * newReIter),
                    focus.im - (yOffset * newImIter)
                ),
                newReWidth, newImHeight
            );
        }
    }
    else if(mouseX != startDragX && mouseY != startDragY) {
        let windowWidth = abs(mouseX - startDragX);
        let windowHeight = abs(mouseY - startDragY);
        let centerX = (mouseX + startDragX) / 2;
        let centerY = (mouseY + startDragY) / 2;

        let center = Complex(
            currImg.frame.reMin + (centerX * currImg.reIter),
            currImg.frame.imMin + (centerY * currImg.reIter)
        );

        if(windowWidth > windowHeight) {
            let newReWidth = windowWidth * currImg.reIter;
            newFrame = new Frame(center, newReWidth, newReWidth);
        }
        else {
            let newImHeight = windowHeight * currImg.imIter;
            newFrame = new Frame(center, newImHeight, newImHeight);
        }
    }
    if(newFrame) {
        currImg.setFrame(newFrame);
        toolbar.updateZoom();
        currImg.reset();
    }
    startDragX = null;
    startDragY = null;
};


canvasElement.onmousemove = function(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    toolbar.displayMouseComplexCoords();
};


canvasElement.onmouseout = function() {
    toolbar.resetMouseComplexCoords();
};



// Keys variables
var keys = {};

// Keys functions
document.onkeydown = function(event) {
    keys[event.key] = true;
};

document.onkeyup = function(event) {
    keys[event.key] = false;
};



// Frames
var defaultView = new Frame(Complex(0, 0), 4, 4);



// Images
var defaultImages = {
    Mandelbrot: new Image(new Mandelbrot(), 100, new Frame(Complex(-0.5, 0), 4, 4)),
    Julia: new Image(new Julia(Complex(-0.8, 0.156)), 200, defaultView),
    Multibrot: new Image(new Multibrot(3), 100, defaultView),
    Multijulia: new Image(new Multijulia(3, Complex(-0.12, -0.8)), 100, defaultView),
    BurningShip: new Image(new BurningShip(), 100, new Frame(Complex(0, -0.5), 4, 4)),
    BurningShipJulia: new Image(new BurningShipJulia(Complex(-1.5, 0)), 100, defaultView),
    Multiship: new Image(new Multiship(3), 100, defaultView),
    MultishipJulia: new Image(new MultishipJulia(3, Complex(-1.326667, 0)), 100, defaultView)
};


// Initial image settings:
var currImg = defaultImages.Mandelbrot.copy();



// Draw loop
var draw = function() {
    if(currImg.drawing) {
        currImg.drawLayer();
    };
    setTimeout(draw, 0);
};


// Run:
toolbar.init();
currImg.reset();
draw();
