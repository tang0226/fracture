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
        escapeRadius: document.getElementById("escape-radius"),
        clickZoomFactor: document.getElementById("click-zoom-factor"),
        palette: document.getElementById("palette"),
        canvasWidth: document.getElementById("canvas-width"),
        canvasHeight: document.getElementById("canvas-height"),
        downloadType: document.getElementById("download-type"),

        // Buttons
        increaseIterations: document.getElementById("increase-iterations"),
        decreaseIterations: document.getElementById("decrease-iterations"),
        redraw: document.getElementById("redraw"),
        download: document.getElementById("download"),

        // Alerts
        exponentAlert: document.getElementById("exponent-alert"),
        juliaConstantAlert: document.getElementById("julia-constant-alert"),
        iterationsAlert: document.getElementById("iterations-alert"),
        iterationIncrementAlert: document.getElementById("iteration-increment-alert"),
        escapeRadiusAlert: document.getElementById("escape-radius-alert"),
        clickZoomFactorAlert: document.getElementById("click-zoom-factor-alert"),
        paletteAlert: document.getElementById("palette-alert"),
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


    // Default parameter values
    defaults: {
        exponent: 3,
        juliaConstant: Complex(0, 1),
        iterations: 100,
        iterationIncrement: 100,
        escapeRadius: 2,
        clickZoomFactor: 4,
    },

    // Booleans for valid inputs
    inputStatus: {
        exponent: true,
        juliaConstant: true,
        iterations: true,
        iterationIncrement: true,
        escapeRadius: true,
        clickZoomFactor: true,
        palette: true,
        canvasWidth: true,
        canvasHeight: true
    },


    // For currently undefined variables
    init() {
        // Internal input variables
        this.fractalType = this.lastFractalType = currImg.fractal.type;
        this.elements.fractalType.value = this.fractalType;

        this.exponent = this.lastExponent = currImg.fractal.params.e || 0;
        this.elements.exponent.value = this.exponent || "";

        this.juliaConstant = this.lastJuliaConstant =
            currImg.fractal.params.c || new Complex(null, null);
        this.elements.juliaConstant.value =
            this.juliaConstant.re ?
            Complex.toString(this.juliaConstant) : "";
        
        this.iterations = currImg.iterations;
        this.elements.iterations.value = this.iterations;

        this.iterationIncrement = this.defaults.iterationIncrement;
        this.elements.iterationIncrement.value = this.iterationIncrement;

        this.escapeRadius = currImg.escapeRadius;
        this.elements.escapeRadius.value = this.escapeRadius;

        this.clickZoomFactor = this.defaults.clickZoomFactor;
        this.elements.clickZoomFactor.value = this.clickZoomFactor;

        this.palette = currImg.palette;
        this.elements.palette.innerHTML = currImg.palette.string;

        this.elements.canvasWidth.value = canvasWidth;
        this.elements.canvasHeight.value = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Inputs
        this.elements.fractalType.setAttribute(
            "onchange",
            "toolbar.updateFractalType()"
        );
        this.elements.exponent.setAttribute(
            "onchange",
            "toolbar.updateExponent()"
        );
        this.elements.juliaConstant.setAttribute(
            "onchange",
            "toolbar.updateJuliaConstant()"
        );
        this.elements.iterations.setAttribute(
            "onchange",
            "toolbar.updateIterations()"
        );
        this.elements.iterationIncrement.setAttribute(
            "onchange",
            "toolbar.updateIterationIncrement()"
        );
        this.elements.escapeRadius.setAttribute(
            "onchange",
            "toolbar.updateEscapeRadius()"
        );
        this.elements.clickZoomFactor.setAttribute(
            "onchange",
            "toolbar.updateCZF()"
        );
        this.elements.palette.setAttribute(
            "onchange",
            "toolbar.updatePalette()"
        );
        this.elements.canvasWidth.setAttribute(
            "onchange",
            "toolbar.updateCanvasWidth()"
        );
        this.elements.canvasHeight.setAttribute(
            "onchange",
            "toolbar.updateCanvasHeight()"
        );

        // Buttons
        this.elements.increaseIterations.setAttribute(
            "onclick",
            "toolbar.increaseIterations()"
        );
        this.elements.decreaseIterations.setAttribute(
            "onclick",
            "toolbar.decreaseIterations()"
        );
        this.elements.redraw.setAttribute(
            "onclick",
            "toolbar.redraw()"
        );
        this.elements.download.setAttribute(
            "onclick",
            "toolbar.download()"
        );

        // Display
        this.resetMouseComplexCoords();
        this.updateFractalType();
        this.displayIterations();
        this.updateZoom();
    },


    // Render time
    displayRenderTime(time) {
        this.elements.renderTime.innerHTML = time.toString() + " ms";
    },


    // Progress
    displayProgress(progress) {
        this.elements.progress.innerHTML = Math.floor(progress) + "%";
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
    updateFractalType() {
        // Set internal fractal type
        this.fractalType = this.elements.fractalType.value;

        // Show exponent and Juila constant inputs where applicable
        if(Fractal.requiresExponent(this.fractalType)) {
            this.elements.exponentContainer.className = "";
        }
        else {
            this.elements.exponentContainer.className = "hide";
            this.elements.exponent.value = this.defaults.exponent;
        }
        if(Fractal.requiresJuliaConstant(this.fractalType)) {
            this.elements.juliaConstantContainer.className = "";
        }
        else {
            this.elements.juliaConstantContainer.className = "hide";
            this.elements.juliaConstant.value =
                Complex.toString(this.defaults.juliaConstant);
        }

        this.updateExponent();
        this.updateJuliaConstant();
    },

    // When exponent input is changed
    updateExponent() {
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
    updateJuliaConstant() {
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
    updateIterations() {
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
    updateIterationIncrement() {
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
    updateEscapeRadius() {
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
        this.elements.zoom.innerHTML = currImg.frame.toZoom().toString();
    },

    // When click zoom factor input is changed
    updateCZF() {
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



    // Palette
    updatePalette() {
        let toSet;

        try {
            toSet = new Palette(this.elements.palette.value, 200);
        }
        catch(error) {
            this.elements.paletteAlert.classList.remove("hide")
            this.inputStatus.palette = false;
            return;
        }

        this.elements.paletteAlert.classList.add("hide");
        currImg.palette = toSet;
        this.inputStatus.palette = true;

        console.log(toSet);
    },



    // Canvas dimensions
    updateCanvasWidth() {
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

    updateCanvasHeight() {
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
    redraw() {
        if(renderInProgress) {
            return;
        }

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
        if(currImg.fractal.requiresExponent) {
            currImg.fractal.params.e = this.exponent;

            // If exponent has changed, return to original frame
            // (i.e. don't stay zoomed in, same for Julia constant below)
            if(this.exponent != this.lastExponent) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        // Check for new Julia constant
        if(currImg.fractal.requiresJuliaConstant) {
            currImg.fractal.params.c = this.juliaConstant;
            if(!Complex.equals(this.juliaConstant, this.lastJuliaConstant)) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        if(fractalChanged) {
            this.syncImageParams();
            if(currMode == "julia") {
                currMode = "default";
                storedImg = null;
            }
        }
        else {
            // Update image iterations
            currImg.iterations = this.iterations;

            // Update image escape radius
            currImg.escapeRadius = this.escapeRadius;
        }

        // Update last fractal parameters for future checks
        this.lastFractalType = this.fractalType;
        this.lastExponent = this.exponent;
        this.lastJuliaConstant = this.juliaConstant;

        // Prepare the image to be redrawn
        currImg.fitToCanvas(canvasWidth, canvasHeight);

        draw();
    },



    // Download
    download() {
        // Create an anchor used to download the image
        let a = document.createElement('a');
        a.setAttribute('download', 'fractal');
        a.setAttribute(
            'href',
            canvas.toDataURL(`image/${this.elements.downloadType.value}`)
        );
        a.click();
    },



    // Sync
    syncFractal() {
        // Sync fractal type

        // Manually set fractal type input and update
        // internals accordingly, a little dirty...
        this.elements.fractalType.value = currImg.fractal.type;
        this.updateFractalType();

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
    },

    syncImageParams() {
        // Sync iterations
        this.elements.iterations.value = currImg.iterations.toString();
        this.iterations = currImg.iterations;

        // Sync escape radius
        this.elements.escapeRadius.value = currImg.escapeRadius.toString();
        this.escapeRadius = currImg.escapeRadius;
        
        // Sync zoom
        this.updateZoom();
    }
};
