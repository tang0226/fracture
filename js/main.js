var canvas = document.getElementById("canvas");
var canvasCtx = canvas.getContext("2d");
var controlsCanvas = document.getElementById("controls-canvas");
var controlsCanvasCtx = controlsCanvas.getContext("2d");

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



// Frames
var defaultView = new Frame(Complex(0, 0), 4, 4);


// Images
var defaultImages = {
    Mandelbrot: new Image(
        new Fractal("Mandelbrot"),
        100, 2,
        new Frame(Complex(-0.5, 0), 4, 4),
        canvasWidth, canvasHeight
    ),
    Julia: new Image(
        new Fractal("Julia", {c: Complex(0, 1)}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    Multibrot: new Image(
        new Fractal("Multibrot", {e: 3}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    Multijulia: new Image(
        new Fractal("Multijulia", {e: 3, c: Complex(-0.12, -0.8)}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    Tricorn: new Image(
        new Fractal("Tricorn"),
        100, 2,
        new Frame(
            Complex(-0.25, 0),
            4, 4
        ),
        canvasWidth, canvasHeight
    ),
    TricornJulia: new Image(
        new Fractal("TricornJulia", {c: Complex(-1, 0)}),
        100, 2,
        new Frame(
            Complex(-0.25, 0),
            4, 4
        ),
        canvasWidth, canvasHeight
    ),
    Multicorn: new Image(
        new Fractal("Multicorn", {e: 3}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    MulticornJulia: new Image(
        new Fractal("MulticornJulia", {e: 3, c: Complex(-1, -1)}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    BurningShip: new Image(
        new Fractal("BurningShip"),
        100, 2,
        new Frame(Complex(0, -0.5), 4, 4),
        canvasWidth, canvasHeight
    ),
    BurningShipJulia: new Image(
        new Fractal("BurningShipJulia", {c: Complex(-1.5, 0)}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    Multiship: new Image(
        new Fractal("Multiship", {e: 3}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    ),
    MultishipJulia: new Image(
        new Fractal("MultishipJulia", {e: 3, c: Complex(-1.326667, 0)}),
        100, 2,
        defaultView,
        canvasWidth, canvasHeight
    )
};

try {
    var p = new Palette("100;0,0 0 0;20,255 0 0;40, 255 255 255;50,0 255 255;75, 255 255 255");
}
catch(error) {
    console.log(error);
}

console.log(p.getColorAt(0.6));


// Initial image settings:
var currImg = defaultImages.Mandelbrot.copy();
var storedImg = null;
var currMode = "default";


var renderInProgress = true;

// Render worker
var renderWorker = new Worker("./js/render.js");

renderWorker.onmessage = function(event) {
    let data = event.data;
    if(data.type == "progress") {
        toolbar.displayRenderTime(data.renderTime);
        toolbar.displayProgress(data.progress);
    }
    if(data.type == "done") {
        canvasCtx.putImageData(data.imgData, 0, 0);
        toolbar.displayRenderTime(data.renderTime);
        renderInProgress = false;
    }
};

var draw = function() {
    renderWorker.postMessage({
        type: "draw",
        img: currImg
    });
    renderInProgress = true;
};



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
    controlsCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
};


// Mouse Events

controlsCanvas.onmousedown = function(event) {
    if(renderInProgress) {
        return;
    }

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

    if(renderInProgress) {
        return;
    }

    let newFrame = false;

    // Click
    if(mouseX == startDragX && mouseY == startDragY) {
        // Julia mode toggling
        if(keys["Alt"]) {
            if(currMode == "default") {
                // Switch to Julia mode

                // Confirm that Julia mode is applicable
                if(!currImg.fractal.requiresJuliaConstant) {
                    currMode = "julia";

                    // Store current image for switching back
                    storedImg = currImg.copy();

                    // Initialize new image based on Julia
                    // equivalent of previous fractal
                    let newFractalType = currImg.fractal.juliaEquivalent;
                    currImg = defaultImages[newFractalType].copy();

                    // New fractal requires a julia constant,
                    // but not necessarily an exponent
                    currImg.fractal.params.c = storedImg.frame.toComplexCoords(
                        mouseX, mouseY,
                        canvasWidth, canvasHeight
                    );
                    if(Fractal.requiresExponent(newFractalType)) {
                        currImg.fractal.params.e = storedImg.fractal.params.e;
                    }
                }
            }

            else {
                // Return to default mode
                currMode = "default";
                currImg = storedImg.copy();
                storedImg = null;
            }
            toolbar.syncFractal();
            toolbar.syncImageParams();
        }

        // Center the frame
        else if(keys["Control"]) {
            let currFrame = currImg.frame;
            newFrame = new Frame(
                currFrame.toComplexCoords(mouseX, mouseY, canvasWidth, canvasHeight),
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
            let focus = currImg.frame.toComplexCoords(
                mouseX, mouseY,
                canvasWidth, canvasHeight
            );
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
    }
    
    currImg.fitToCanvas(canvasWidth, canvasHeight);
    toolbar.updateZoom();
    draw();

    // Reset drag
    resetDrag();
};


controlsCanvas.onmousemove = function(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    toolbar.displayMouseComplexCoords();
    if(mouseDown) {
        controlsCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        controlsCanvasCtx.strokeStyle = "#FF0000";
        controlsCanvasCtx.strokeRect(
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
        toolbar.redraw();
    }
};

window.onkeyup = function(event) {
    keys[event.key] = false;
};

window.onblur = function() {
    resetKeys();
}



// Run:
toolbar.init();
draw();
