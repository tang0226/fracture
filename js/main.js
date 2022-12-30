var canvas = document.getElementById("canvas");
var canvasCtx = canvas.getContext("2d");
var controlsCanvas = document.getElementById("controls-canvas");
var controlscanvasCtx = controlsCanvas.getContext("2d");

var canvasWidth = 600;
var canvasHeight = 600;

var setCanvasDim = function(w, h) {
    canvas.width = w;
    canvas.height = h;
    controlsCanvas.width = w;
    controlsCanvas.height = h;
    canvasWidth = w;
    canvasHeight = h;
}

setCanvasDim(canvasWidth, canvasHeight);



// Color functions
var hsl = function(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

var rgb = function(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}



// Math functions
var scale = function(n, minFrom, maxFrom, minTo, maxTo) {
    return ((n / (maxFrom - minFrom)) * (maxTo - minTo)) + minTo;
};



// Frames
var defaultView = new Frame(Complex(0, 0), 4, 4);



// Images
var defaultImages = {
    Mandelbrot: new Image(new Mandelbrot(), 100, new Frame(Complex(-0.5, 0), 4, 4)),
    Julia: new Image(new Julia(Complex(-0.8, 0.156)), 100, defaultView),
    Multibrot: new Image(new Multibrot(3), 100, defaultView),
    Multijulia: new Image(new Multijulia(3, Complex(-0.12, -0.8)), 100, defaultView),
    BurningShip: new Image(new BurningShip(), 100, new Frame(Complex(0, -0.5), 4, 4)),
    BurningShipJulia: new Image(new BurningShipJulia(Complex(-1.5, 0)), 100, defaultView),
    Multiship: new Image(new Multiship(3), 100, defaultView),
    MultishipJulia: new Image(new MultishipJulia(3, Complex(-1.326667, 0)), 100, defaultView)
};


// Initial image settings:
var currImg = defaultImages.Mandelbrot.copy();
var storedImg = null;
var currMode = "default";



// Mouse variables
var mouseX = null;
var mouseY = null;
var startDragX = null;
var startDragY = null;
var mouseDown = false;


// Mouse functions
var resetDrag = function() {
    mouseDown = false;
    startDragX = null;
    startDragY = null;
    controlscanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
};


// Mouse Events

controlsCanvas.onmousedown = function(event) {
    if(event.buttons == 1) {
        if(!mouseDown) {
            startDragX = mouseX;
            startDragY = mouseY;
        }
        mouseDown = true;
    }
};


// Based on mouse coordinates, click/drag,
// and keyboard events, draw the new image
controlsCanvas.onmouseup = function() {
    // Glitch-proofing
    if(!mouseDown) {
        return;
    }

    let newFrame;

    // Click
    if(mouseX == startDragX && mouseY == startDragY) {
        // Julia mode toggling
        if(keys["Alt"]) {
            if(currMode == "default") {
                // Switch to Julia mode

                // Confirm that Julia mode is applicable
                if(!requiresJuliaConstant(currImg.getFractalType())) {
                    currMode = "julia";

                    // Store current image for switching back
                    storedImg = currImg.copy();

                    // Initialize new image based on Julia
                    // equivalent of previous fractal
                    newFractal = getJuliaEquivalent(currImg.getFractalType());
                    currImg = defaultImages[newFractal].copy();

                    // New fractal requires a julia constant,
                    // but not necessarily an exponent
                    currImg.fractal.c = storedImg.frame.toComplexCoords(mouseX, mouseY);
                    if(requiresExponent(newFractal)) {
                        currImg.fractal.e = storedImg.fractal.e;
                    }

                    // Draw the new image
                    currImg.reset();
                }
            }

            else {

                // Return to default mode
                currMode = "default";
                currImg = storedImg.copy();
                storedImg = null;
                currImg.reset();
            }

            toolbar.syncWithImage();
        }

        // Center the frame
        else if(keys["Control"]) {
            let currFrame = currImg.frame;
            newFrame = new Frame(
                currFrame.toComplexCoords(mouseX, mouseY),
                currFrame.reWidth,
                currFrame.imHeight
            );
        }

        // Zoom
        else {
            let zoomFactor = toolbar.clickZoomFactor;

            // Calculations to keep clicked point
            // in the same position on canvas
            let xOffset = mouseX - (canvasWidth / 2);
            let yOffset = mouseY - (canvasHeight / 2);
            
            let newReWidth = currImg.frame.reWidth;
            let newImHeight = currImg.frame.imHeight;

            // Zoom out
            if(keys["Shift"]) {
                newReWidth *= zoomFactor;
                newImHeight *= zoomFactor;
            }

            // Zoom in
            else {
                newReWidth /= zoomFactor;
                newImHeight /= zoomFactor;
            }

            // Update frame
            let focus = currImg.frame.toComplexCoords(mouseX, mouseY);
            newFrame = new Frame(
                Complex(
                    focus.re - (xOffset * newReWidth / canvasWidth),
                    focus.im - (yOffset * newImHeight / canvasHeight)
                ),
                newReWidth, newImHeight
            );
        }
    }

    // Drag
    else if(mouseX != startDragX && mouseY != startDragY) {
        newFrame = new Frame(
            Complex(
                currImg.frame.reMin + ((mouseX + startDragX) / 2 * currImg.complexIter),
                currImg.frame.imMin + ((mouseY + startDragY) / 2 * currImg.complexIter)
            ),
            Math.abs(mouseX - startDragX) * currImg.complexIter,
            Math.abs(mouseY - startDragY) * currImg.complexIter
        );
    }

    // Update frame
    if(newFrame) {
        currImg.setFrame(newFrame);
        currImg.fitToCanvas();
        toolbar.updateZoom();
        currImg.reset();
    }

    // Reset drag
    resetDrag();
};


controlsCanvas.onmousemove = function(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    toolbar.displayMouseComplexCoords();
    if(mouseDown) {
        controlscanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        controlscanvasCtx.strokeStyle = rgb(255, 0, 0);
        controlscanvasCtx.strokeRect(
            Math.min(startDragX, mouseX),
            Math.min(startDragY, mouseY),
            Math.abs(mouseX - startDragX),
            Math.abs(mouseY - startDragY)
        );
    }
};


controlsCanvas.onmouseout = function() {
    resetDrag();

    // Display N/A for mouse coordinates
    toolbar.resetMouseComplexCoords();
};



// Keys variables
var keys = {};

// Keys functions
var resetKeys = function() {
    for(let key in keys) {
        keys[key] = false;
    }
};

window.onkeydown = function(event) {
    keys[event.key] = true;
    if(event.key == "Escape") {
        resetDrag();
    }
    if(event.key == "Enter") {
        document.activeElement.blur();
        toolbar.redrawImage();
    }
};

window.onkeyup = function(event) {
    keys[event.key] = false;
};

window.onblur = function() {
    resetKeys();
}



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
