/******************************
TOOLBAR OBJECT
******************************/ 

var toolbar = {

    // Elements
    elements: {
        // Inputs
        fractalType: document.getElementById("fractal-type"),
        exponent: document.getElementById("exponent"),
        juliaConstant: document.getElementById("julia-constant"),
        iterations: document.getElementById("iterations"),
        iterationIncrement: document.getElementById("iteration-increment"),
        clickZoomFactor: document.getElementById("click-zoom-factor"),
        canvasWidth: document.getElementById("canvas-width"),
        canvasHeight: document.getElementById("canvas-height"),

        // Alerts
        exponentAlert: document.getElementById("exponent-alert"),
        juliaConstantAlert: document.getElementById("julia-constant-alert"),
        iterationsAlert: document.getElementById("iterations-alert"),
        iterationIncrementAlert: document.getElementById("iteration-increment-alert"),
        clickZoomFactorAlert: document.getElementById("click-zoom-factor-alert"),
        canvasWidthAlert: document.getElementById("canvas-width-alert"),
        canvasHeightAlert: document.getElementById("canvas-height-alert"),

        // Display
        renderTime: document.getElementById("render-time"),
        mouseComplexCoords: document.getElementById("mouse-complex-coords"),
        zoom: document.getElementById("zoom"),

        // Containers
        exponentContainer: document.getElementById("exponent-container"),
        juliaConstantContainer: document.getElementById("julia-constant-container")
    },

    inputStatus: {
        exponent: true,
        juliaConstant: true,
        iterations: true,
        iterationIncrement: true,
        clickZoomFactor: true,
        canvasWidth: true,
        canvasHeight: true
    },


    // For currently undefined variables
    init() {
        this.fractalType = this.lastFractalType = currImg.getFractalType();
        this.exponent = this.lastExponent = currImg.fractal.e || null;
        this.juliaConstant = this.lastJuliaConstant = currImg.fractal.c || Complex(null, null);1001
        this.iterations = currImg.iterations;
        this.iterationIncrement = Number(this.elements.iterationIncrement.value);
        this.zoom = currImg.frame.toZoom();
        this.clickZoomFactor = Number(this.elements.clickZoomFactor.value);
        this.elements.canvasWidth.value = _width;
        this.elements.canvasHeight.value = _height;
        this.canvasWidth = _width;
        this.canvasHeight = _height;
        this.resetMouseComplexCoords();
        this.displayIterations();
        this.updateZoom();
    },


    // Render time
    displayRenderTime(time) {
        this.elements.renderTime.innerHTML = (time.getUTCSeconds() * 1000 + time.getUTCMilliseconds()).toString();
    },


    // Mouse complex coordinates
    displayMouseComplexCoords() {
        let complexCoords = currImg.frame.toComplexCoords(mouseX, mouseY);
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
        if(toSet == NaN || toSet < 1 || !Number.isInteger(toSet)) {
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



    // Iterations

    // Display internal iterations
    displayIterations() {
        this.elements.iterations.value = this.iterations.toString();
    },

    // When iterations input is changed
    updateInternalIterations() {
        let toSet = Number(this.elements.iterations.value);

        // Sanitize
        if(toSet == NaN || toSet < 1 || !Number.isInteger(toSet)) {
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
        if(toSet == NaN || !Number.isInteger(toSet)) {
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
        if(toSet == NaN || toSet <= 0) {
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
        if(toSet == NaN || toSet < 1 || !Number.isInteger(toSet)) {
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
        if(toSet == NaN || toSet < 1 || !Number.isInteger(toSet)) {
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
        if(this.canvasWidth != _width || this.canvasHeight != _height) {
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
        if(requiresExponent(currImg.getFractalType())) {
            currImg.fractal.e = this.exponent;

            // If exponent has changed, return to original frame
            // (i.e. don't stay zoomed in, same for Julia constant below)
            if(this.exponent != this.lastExponent) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        // Check for new Julia constant
        if(requiresJuliaConstant(currImg.getFractalType())) {
            currImg.fractal.c = this.juliaConstant;
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

        // Exit Julia mode if the fractal was changed
        if(fractalChanged && currMode == "julia") {
            currMode = "default";
            storedImg = null;
            this.syncWithImage();
        }

        // Prepare the image to be redrawn
        currImg.fitToCanvas();
        currImg.reset();
    },



    // Sync
    syncWithImage() {
        // Sync fractal type

        // Manually set fractal type input and update
        // internals accordingly, a little dirty...
        this.elements.fractalType.value = currImg.getFractalType();
        this.updateInternalFractalType();

        let currFractal = currImg.fractal;
        this.fractalType = currFractal;
        this.lastFractalType = currFractal;

        // Sync Exponent
        if(currFractal.e) {
            this.elements.exponent.value = currFractal.e.toString();
            this.exponent = this.lastExponent = currFractal.e;
        }

        // Sync Julia constant
        if(currFractal.c) {
            this.elements.juliaConstant.value = Complex.toString(currImg.fractal.c);
            this.juliaConstant = this.lastJuliaConstant = currFractal.c;
        }

        // Sync iterations
        this.elements.iterations.value = currImg.iterations.toString();
        this.iterations = currImg.iterations;
        
        // Sync zoom
        this.updateZoom();
    }
};
