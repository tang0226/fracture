const canvas = document.getElementById("canvas");
const canvasCtx = canvas.getContext("2d");
const controlsCanvas = document.getElementById("controls-canvas");
const controlsCanvasCtx = controlsCanvas.getContext("2d");

var canvasWidth = 600;
var canvasHeight = 600;

function setCanvasDim(w, h) {
    canvas.width = w;
    canvas.height = h;
    controlsCanvas.width = w;
    controlsCanvas.height = h;
    canvasWidth = w;
    canvasHeight = h;
}

setCanvasDim(canvasWidth, canvasHeight);



// Frames
const defaultView = new Frame(Complex(0, 0), 4, 4);


// Gradient

const defaultGradient = new Gradient(
    "12;\
    0, 0 0 0;\
    1, 255 0 0;\
    2, 0 0 0;\
    3, 255 255 0;\
    4, 0 0 0;\
    5, 0 255 0;\
    6, 0 0 0;\
    7, 0 255 255;\
    8, 0 0 0;\
    9, 0 0 255;\
    10, 0 0 0;\
    11, 255 0 255;",
    "linear"
);



// Images
const defaultImages = {
    Mandelbrot: new Image({
        fractal: new Fractal("Mandelbrot"),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: new Frame(Complex(-0.5, 0), 4, 4),
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    Julia: new Image({
        fractal: new Fractal("Julia", {c: Complex(0, 1)}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    Multibrot: new Image({
        fractal: new Fractal("Multibrot", {e: 3}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    Multijulia: new Image({
        fractal: new Fractal("Multijulia", {e: 3, c: Complex(-0.12, -0.8)}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    Tricorn: new Image({
        fractal: new Fractal("Tricorn"),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: new Frame(
            Complex(-0.25, 0),
            4, 4
        ),
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    TricornJulia: new Image({
        fractal: new Fractal("TricornJulia", {c: Complex(-1, 0)}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    Multicorn: new Image({
        fractal: new Fractal("Multicorn", {e: 3}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    MulticornJulia: new Image({
        fractal: new Fractal("MulticornJulia", {e: 3, c: Complex(-1, -1)}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    BurningShip: new Image({
        fractal: new Fractal("BurningShip"),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    BurningShipJulia: new Image({
        fractal: new Fractal("BurningShipJulia", {c: Complex(-1.5, 0)}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    Multiship: new Image({
        fractal: new Fractal("Multiship", {e: 3}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    }),
    MultishipJulia: new Image({
        fractal: new Fractal("MultishipJulia", {e: 3, c: Complex(-1.326667, 0)}),
        iterations: 1000,
        escapeRadius: 256,
        smoothColoring: true,
        srcFrame: defaultView,
        gradient: defaultGradient,
        itersPerCycle: 200,
        width: canvasWidth,
        height: canvasHeight
    })
};



// Initial image settings:
var currImg = defaultImages.Mandelbrot.copy();
var storedImg = null;
var currMode = "default";


var renderInProgress = true;

// Render worker
const renderWorker = new Worker("./js/render.js");

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

function draw() {
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
function resetDrag() {
    mouseDown = false;
    startDragX = null;
    startDragY = null;
    controlsCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
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
    if(!mouseDown || renderInProgress || !toolbar.inputStatus.gradient) {
        // Reset drag
        resetDrag();
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

                else {
                    return;
                }
            }

            else {
                // Return to default mode
                currMode = "default";
                currImg = storedImg.copy();
                storedImg = null;
            }
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
    toolbar.matchFractal();
    toolbar.matchImageParams();
    toolbar.setImgGradient();
    toolbar.clearErrors();
    
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
const keys = {};

// Keys functions
function resetKeys() {
    for(let key in keys) {
        keys[key] = false;
    }
};

window.onkeydown = function(event) {
    keys[event.key] = true;
    if(event.key == "Escape") {
        resetDrag();
    }

    // <Enter> redraws image, except when editing the gradient
    if(event.key == "Enter" && document.activeElement.nodeName != "TEXTAREA") {
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
