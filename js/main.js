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
        new Fractal("Julia", {c: Complex(-0.8, 0.156)}),
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


// Initial image settings:
var currImg = defaultImages.Mandelbrot.copy();
var storedImg = null;
var currMode = "default";



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
    }
};

var draw = function() {
    renderWorker.postMessage({
        type: "draw",
        img: currImg
    })
};



// Toolbar
var toolbar = {

    // Elements
    elements: {
        // Inputs
        fractalType: document.getElementById("fractal-type"),
        exponent: document.getElementById("exponent"),
        juliaConstant: document.getElementById("julia-constant"),
        iterations: document.getElementById("iterations"),
        iterationIncrement: document.getElementById("iteration-increment"),
        escapeRadius: document.getElementById("escape-radius"),
        clickZoomFactor: document.getElementById("click-zoom-factor"),
        canvasWidth: document.getElementById("canvas-width"),
        canvasHeight: document.getElementById("canvas-height"),

        // Buttons
        increaseIterations: document.getElementById("increase-iterations"),
        decreaseIterations: document.getElementById("decrease-iterations"),
        redraw: document.getElementById("redraw"),

        // Alerts
        exponentAlert: document.getElementById("exponent-alert"),
        juliaConstantAlert: document.getElementById("julia-constant-alert"),
        iterationsAlert: document.getElementById("iterations-alert"),
        iterationIncrementAlert: document.getElementById("iteration-increment-alert"),
        escapeRadiusAlert: document.getElementById("escape-radius-alert"),
        clickZoomFactorAlert: document.getElementById("click-zoom-factor-alert"),
        canvasWidthAlert: document.getElementById("canvas-width-alert"),
        canvasHeightAlert: document.getElementById("canvas-height-alert"),

        // Display
        renderTime: document.getElementById("render-time"),
        progress: document.getElementById("progress"),
        progressBar: document.getElementById("progress-bar"),
        mouseComplexCoords: document.getElementById("mouse-complex-coords"),
        zoom: document.getElementById("zoom"),

        // Containers
        exponentContainer: document.getElementById("exponent-container"),
        juliaConstantContainer: document.getElementById("julia-constant-container")
    },

    // Booleans for valid inputs
    inputStatus: {
        exponent: true,
        juliaConstant: true,
        iterations: true,
        iterationIncrement: true,
        escapeRadius: true,
        clickZoomFactor: true,
        canvasWidth: true,
        canvasHeight: true
    },


    // For currently undefined variables
    init() {
        // Internal input variables
        this.fractalType = this.lastFractalType = currImg.fractal.type;
        this.exponent = this.lastExponent = currImg.fractal.params.e || null;
        this.juliaConstant = this.lastJuliaConstant =
            currImg.fractal.params.c || Complex(null, null);
        this.iterations = currImg.iterations;
        this.iterationIncrement = Number(this.elements.iterationIncrement.value);
        this.escapeRadius = Number(this.elements.escapeRadius.value);
        this.zoom = currImg.frame.toZoom();
        this.clickZoomFactor = Number(this.elements.clickZoomFactor.value);
        this.elements.canvasWidth.value = canvasWidth;
        this.elements.canvasHeight.value = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Inputs
        this.elements.fractalType.onchange = function() {
            toolbar.updateInternalFractalType();
        };
        this.elements.exponent.onchange = function() {
            toolbar.updateInternalExponent();
        };
        this.elements.juliaConstant.onchange = function() {
            toolbar.updateInternalJuliaConstant();
        };
        this.elements.iterations.onchange = function() {
            toolbar.updateInternalIterations();
        };
        this.elements.iterationIncrement.onchange = function() {
            toolbar.updateInternalIterationIncrement();
        };
        this.elements.escapeRadius.onchange = function() {
            toolbar.updateInternalEscapeRadius();
        };
        this.elements.clickZoomFactor.onchange = function() {
            toolbar.updateInternalCZF();
        };
        this.elements.canvasWidth.onchange = function() {
            toolbar.updateInternalCanvasWidth();
        }
        this.elements.canvasHeight.onchange = function() {
            toolbar.updateInternalCanvasHeight();
        };

        // Buttons
        this.elements.increaseIterations.onclick = function() {
            toolbar.increaseIterations();
        };
        this.elements.decreaseIterations.onclick = function() {
            toolbar.decreaseIterations();
        };
        this.elements.redraw.onclick = function() {
            toolbar.redrawImage();
        }

        // Display
        this.resetMouseComplexCoords();
        this.displayIterations();
        this.updateZoom();
    },


    // Render time
    displayRenderTime(time) {
        this.elements.renderTime.innerHTML = time.toString() + " ms";
    },


    // Progress
    displayProgress(progress) {
        this.elements.progress.innerHTML = progress + "%";
        this.elements.progressBar.value = progress;
    },


    // Mouse complex coordinates
    displayMouseComplexCoords() {
        let complexCoords = currImg.frame.toComplexCoords(
            mouseX, mouseY,
            canvasWidth, canvasHeight
        );
        let complexRe = complexCoords.re.toString();
        let complexIm = complexCoords.im.toString();
        if(Number(complexIm) >= 0) {
            complexIm = "+" + complexIm;
        }
        this.elements.mouseComplexCoords.innerHTML = complexRe + complexIm + "i";
    },

    resetMouseComplexCoords() {
        this.elements.mouseComplexCoords.innerHTML = "N/A";
    },



    // Fractal

    // When fractal select is changed
    updateInternalFractalType() {
        // Set internal fractal type
        this.fractalType = this.elements.fractalType.value;

        // Show exponent and Juila constant inputs where applicable
        if(requiresExponent(this.fractalType)) {
            this.elements.exponentContainer.className = "";
        }
        else {
            this.elements.exponentContainer.className = "hide";
        }
        if(requiresJuliaConstant(this.fractalType)) {
            this.elements.juliaConstantContainer.className = "";

        }
        else {
            this.elements.juliaConstantContainer.className = "hide";
        }
    },

    // When exponent input is changed
    updateInternalExponent() {
        let toSet = Number(this.elements.exponent.value);

        // Sanitize
        if(Number.isNaN(toSet) || toSet < 1 || !Number.isInteger(toSet)) {
            this.elements.exponentAlert.classList.remove("hide");
            this.inputStatus.exponent = false;
        }
        else {
            this.exponent = toSet;
            this.elements.exponentAlert.classList.add("hide");
            this.inputStatus.exponent = true;
        }
    },

    // When Julia constant input is changed
    updateInternalJuliaConstant() {
        let toSet = Complex.parseString(this.elements.juliaConstant.value);

        // Sanitize
        if(toSet == undefined) {
            this.elements.juliaConstantAlert.classList.remove("hide");
            this.inputStatus.juliaConstant = false;
        }
        else {
            this.juliaConstant = toSet;
            this.elements.juliaConstantAlert.classList.add("hide");
            this.inputStatus.juliaConstant = true;
        }
    },



    // Image quality (iterations and escape radius)

    // Display internal iterations
    displayIterations() {
        this.elements.iterations.value = this.iterations.toString();
    },

    // When iterations input is changed
    updateInternalIterations() {
        let toSet = Number(this.elements.iterations.value);

        // Sanitize
        if(Number.isNaN(toSet) || toSet < 1 || !Number.isInteger(toSet)) {
            this.elements.iterationsAlert.classList.remove("hide");
            this.inputStatus.iterations = false;
        }
        else {
            this.iterations = toSet;
            this.elements.iterationsAlert.classList.add("hide");
            this.inputStatus.iterations = true;
        }
    },

    // Set internal and displayed iterations 
    setIterations(iterations) {
        this.iterations = iterations;
        this.displayIterations();
    },

    // When iteration increment input is changed
    updateInternalIterationIncrement() {
        let toSet = Number(this.elements.iterationIncrement.value);

        // Sanitize
        if(Number.isNaN(toSet) || !Number.isInteger(toSet)) {
            this.elements.iterationIncrementAlert.classList.remove("hide");
            this.inputStatus.iterationIncrement = false;
        }
        else {
            this.iterationIncrement = toSet;
            this.elements.iterationIncrementAlert.classList.add("hide");
            this.inputStatus.iterationIncrement = true;
        }
    },

    // For +iterations button
    increaseIterations() {
        this.setIterations(this.iterations + this.iterationIncrement);
    },

    // For -iterations button
    decreaseIterations() {
        this.setIterations(this.iterations - this.iterationIncrement);
    },


    // Escape radius
    updateInternalEscapeRadius() {
        let toSet = Number(this.elements.escapeRadius.value);

        // Sanitize
        if(Number.isNaN(toSet) || toSet < 2) {
            this.elements.escapeRadiusAlert.classList.remove("hide");
            this.inputStatus.escapeRadius = false;
        }
        else {
            this.escapeRadius = toSet;
            this.elements.escapeRadiusAlert.classList.add("hide");
            this.inputStatus.escapeRadius = true;
        }
    },



    // Zoom

    // Sync internal and external zoom with current image
    updateZoom() {
        let zoom = currImg.frame.toZoom();
        this.zoom = zoom;
        this.elements.zoom.innerHTML = this.zoom.toString();
    },

    // When click zoom factor input is changed
    updateInternalCZF() {
        let toSet = Number(this.elements.clickZoomFactor.value);

        // Sanitize
        if(Number.isNaN(toSet) || toSet <= 0) {
            this.elements.clickZoomFactorAlert.classList.remove("hide");
            this.inputStatus.clickZoomFactor = false;
        }
        else {
            this.clickZoomFactor = toSet;
            this.elements.clickZoomFactorAlert.classList.add("hide");
            this.inputStatus.clickZoomFactor = true;
        }
    },



    // Canvas dimensions
    updateInternalCanvasWidth() {
        let toSet = Number(this.elements.canvasWidth.value);

        // Sanitize
        if(Number.isNaN(toSet) || toSet < 1 || !Number.isInteger(toSet)) {
            this.elements.canvasWidthAlert.classList.remove("hide");
            this.inputStatus.canvasWidth = false;
        }
        else {
            this.canvasWidth = toSet;
            this.elements.canvasWidthAlert.classList.add("hide");
            this.inputStatus.canvasWidth = true;
        }
    },

    updateInternalCanvasHeight() {
        let toSet = Number(this.elements.canvasHeight.value);

        // Sanitize
        if(Number.isNaN(toSet) || toSet < 1 || !Number.isInteger(toSet)) {
            this.elements.canvasHeightAlert.classList.remove("hide");
            this.inputStatus.canvasHeight = false;
        }
        else {
            this.canvasHeight = toSet;
            this.elements.canvasHeightAlert.classList.add("hide");
            this.inputStatus.canvasHeight = true;
        }
    },



    // Redraw
    redrawImage() {
        // Check for bad inputs
        for(let key in this.inputStatus) {
            if(!this.inputStatus[key]) {
                return;
            }
        }
        
        // Update canvas dimensions if changed
        if(this.canvasWidth != canvasWidth || this.canvasHeight != canvasHeight) {
            setCanvasDim(this.canvasWidth, this.canvasHeight);
        }

        // For checking if any fractal parameters were changed;
        // If so, exit Julia mode
        let fractalChanged = false;
        
        // Check for new fractal type
        if(this.fractalType != this.lastFractalType) {
            currImg = defaultImages[this.fractalType].copy();
            fractalChanged = true;
        }

        // Check for new exponent
        if(requiresExponent(currImg.fractal.type)) {
            currImg.fractal.params.e = this.exponent;

            // If exponent has changed, return to original frame
            // (i.e. don't stay zoomed in, same for Julia constant below)
            if(this.exponent != this.lastExponent) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        // Check for new Julia constant
        if(requiresJuliaConstant(currImg.fractal.type)) {
            currImg.fractal.params.c = this.juliaConstant;
            if(!Complex.equals(this.juliaConstant, this.lastJuliaConstant)) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        // Update last fractal parameters for future checks
        this.lastFractalType = this.fractalType;
        this.lastExponent = this.exponent;
        this.lastJuliaConstant = this.juliaConstant;

        // Update image iterations
        currImg.iterations = this.iterations;

        // Update image escape radius
        currImg.escapeRadius = this.escapeRadius;

        // Exit Julia mode if the fractal was changed
        if(fractalChanged && currMode == "julia") {
            currMode = "default";
            storedImg = null;
            this.syncWithImage();
        }

        // Prepare the image to be redrawn
        currImg.fitToCanvas(canvasWidth, canvasHeight);

        draw();
    },



    // Sync
    syncWithImage() {
        // Sync fractal type

        // Manually set fractal type input and update
        // internals accordingly, a little dirty...
        this.elements.fractalType.value = currImg.fractal.type;
        this.updateInternalFractalType();

        let currFractal = currImg.fractal;
        this.fractalType = currFractal;
        this.lastFractalType = currFractal;

        // Sync Exponent
        if(currFractal.params.e) {
            this.elements.exponent.value = currFractal.params.e.toString();
            this.exponent = this.lastExponent = currFractal.params.e;
        }

        // Sync Julia constant
        if(currFractal.params.c) {
            this.elements.juliaConstant.value = Complex.toString(currImg.fractal.params.c);
            this.juliaConstant = this.lastJuliaConstant = currFractal.params.c;
        }

        // Sync iterations
        this.elements.iterations.value = currImg.iterations.toString();
        this.iterations = currImg.iterations;
        
        // Sync zoom
        this.updateZoom();
    }
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

    let newFrame = false;

    // Click
    if(mouseX == startDragX && mouseY == startDragY) {
        // Julia mode toggling
        if(keys["Alt"]) {
            if(currMode == "default") {
                // Switch to Julia mode

                // Confirm that Julia mode is applicable
                if(!requiresJuliaConstant(currImg.fractal.type)) {
                    currMode = "julia";

                    // Store current image for switching back
                    storedImg = currImg.copy();

                    // Initialize new image based on Julia
                    // equivalent of previous fractal
                    let newFractal = getJuliaEquivalent(currImg.fractal.type);
                    currImg = defaultImages[newFractal].copy();

                    // New fractal requires a julia constant,
                    // but not necessarily an exponent
                    currImg.fractal.params.c = storedImg.frame.toComplexCoords(
                        mouseX, mouseY,
                        canvasWidth, canvasHeight
                    );
                    if(requiresExponent(newFractal)) {
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

            toolbar.syncWithImage();
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
        controlsCanvasCtx.strokeStyle = rgb(255, 0, 0);
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
        toolbar.redrawImage();
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
