/******************************
TOOLBAR OBJECT
******************************/

const toolbar = {
    // Elements
    elements: {
        // Navigation
        nav: {
            fractal: document.getElementById("fractal-nav"),
            frame: document.getElementById("frame-nav"),
            image: document.getElementById("image-nav")
        },

        // Sections
        sections: {
            fractal: document.getElementById("fractal-section"),
            frame: document.getElementById("frame-section"),
            image: document.getElementById("image-section")
        },

        // Inputs
        fractalType: document.getElementById("fractal-type"),
        exponent: document.getElementById("exponent"),
        juliaConstant: document.getElementById("julia-constant"),
        iterations: document.getElementById("iterations"),
        iterationIncrement: document.getElementById("iteration-increment"),
        escapeRadius: document.getElementById("escape-radius"),
        clickZoomFactor: document.getElementById("click-zoom-factor"),
        smoothColoring: document.getElementById("smooth-coloring"),
        gradient: document.getElementById("gradient"),
        itersPerCycle: document.getElementById("iters-per-cycle"),
        canvasWidth: document.getElementById("canvas-width"),
        canvasHeight: document.getElementById("canvas-height"),
        downloadType: document.getElementById("download-type"),

        // Buttons
        increaseIterations: document.getElementById("increase-iterations"),
        decreaseIterations: document.getElementById("decrease-iterations"),
        resetZoom: document.getElementById("reset-zoom"),
        redraw: document.getElementById("redraw"),
        download: document.getElementById("download"),

        // Alerts
        alerts: {
            exponent: document.getElementById("exponent-alert"),
            juliaConstant: document.getElementById("julia-constant-alert"),
            iterations: document.getElementById("iterations-alert"),
            iterationIncrement: document.getElementById("iteration-increment-alert"),
            escapeRadius: document.getElementById("escape-radius-alert"),
            clickZoomFactor: document.getElementById("click-zoom-factor-alert"),
            gradient: document.getElementById("gradient-alert"),
            itersPerCycle: document.getElementById("ipc-alert"),
            canvasWidth: document.getElementById("canvas-width-alert"),
            canvasHeight: document.getElementById("canvas-height-alert")
        },

        // Display
        renderTime: document.getElementById("render-time"),
        progress: document.getElementById("progress"),
        progressBar: document.getElementById("progress-bar"),
        mouseComplexCoords: document.getElementById("mouse-complex-coords"),
        zoom: document.getElementById("zoom"),
        gradientCanvas: document.getElementById("gradient-canvas"),

        // Containers
        exponentContainer: document.getElementById("exponent-container"),
        juliaConstantContainer: document.getElementById("julia-constant-container")
    },


    // Default parameter values
    defaults: {
        exponent: 3,
        juliaConstant: Complex(0, 1),
        iterations: 100,
        iterationIncrement: 1000,
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
        gradient: true,
        itersPerCycle: true,
        canvasWidth: true,
        canvasHeight: true
    },


    // For currently undefined variables
    init() {
        // Navigation
        this.currSection = "fractal";

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

        this.smoothColoring = currImg.smoothColoring;
        this.elements.smoothColoring.checked = currImg.smoothColoring;

        this.gradient = currImg.gradient;
        this.elements.gradient.value = currImg.gradient.string;

        this.gradientCanvasCtx = this.elements.gradientCanvas.getContext("2d");
        this.drawGradient();

        this.itersPerCycle = currImg.itersPerCycle;
        this.elements.itersPerCycle.value = currImg.itersPerCycle;

        this.elements.canvasWidth.value = canvasWidth;
        this.elements.canvasHeight.value = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Display
        this.resetMouseComplexCoords();
        this.updateFractalType();
        this.displayIterations();
        this.updateZoom();
    },

    
    // Navigation
    selectSection(newSection) {
        // Hide current section
        this.elements.sections[this.currSection]
            .classList.add("hide");

        // Show new section
        this.elements.sections[newSection]
            .classList.remove("hide");

        // Give inactive class to old navbar div
        this.elements.nav[this.currSection]
            .classList.remove("active");
        this.elements.nav[this.currSection]
            .classList.add("inactive");

        // Give active class to new navbar div
        this.elements.nav[newSection]
            .classList.remove("inactive");
        this.elements.nav[newSection]
            .classList.add("active");
        
        this.currSection = newSection;
    },


    // Render time
    displayRenderTime(time) {
        let t = time;
        let s = (t % 1000) + " ms";

        if(t >= 1000) {
            t = Math.floor(t / 1000);
            s = (t % 60) + " s " + s;

            if(t >= 60) {
                t = Math.floor(t / 60);
                s = (t % 60) + " min " + s;

                if(t >= 60) {
                    s = Math.floor(t / 60) + " h " + s;
                }
            }
        }
        
        this.elements.renderTime.innerHTML = s;
    },


    // Progress
    displayProgress(progress) {
        this.elements.progress.innerHTML = Math.floor(progress) + "%";
        this.elements.progressBar.value = progress;
    },


    // Mouse coordinates
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
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.exponent.innerHTML =
                "Exponent must be a number";
            newStatus = false;
        }
        else if(toSet <= 1) {
            this.elements.alerts.exponent.innerHTML =
                "Exponent must be greater than 1";
            newStatus = false;
        }
        else if(!Number.isInteger(toSet)) {
            this.elements.alerts.exponent.innerHTML =
                "Exponent must be an integer";
            newStatus = false;
        }
        else {
            this.exponent = toSet;
            this.elements.alerts.exponent.innerHTML = "";
        }
        this.inputStatus.exponent = newStatus;
    },

    // When Julia constant input is changed
    updateJuliaConstant() {
        let toSet = Complex.parseString(this.elements.juliaConstant.value);

        // Sanitize
        if(toSet == undefined) {
            this.elements.alerts.juliaConstant.innerHTML =
                "Julia constant must be of the form a+bi";
            this.inputStatus.juliaConstant = false;
        }
        else {
            this.juliaConstant = toSet;
            this.elements.alerts.juliaConstant.innerHTML = "";
            this.inputStatus.juliaConstant = true;
        }
    },



    // Image quality (iterations and escape radius)

    // Display internal iterations
    displayIterations() {
        this.elements.iterations.value = this.iterations;
    },

    // When iterations input is changed
    updateIterations() {
        let toSet = Number(this.elements.iterations.value);

        // Sanitize
        let newStatus = true;
        
        if(Number.isNaN(toSet)) {
            this.elements.alerts.iterations.innerHTML =
                "Iterations must be a number";
            newStatus = false;
        }
        else if(toSet < 1) {
            this.elements.alerts.iterations.innerHTML =
                "Iterations must be greater than 1";
            newStatus = false;
        }
        else if(!Number.isInteger(toSet)) {
            this.elements.alerts.iterations.innerHTML =
                "Iterations must be an integer";
            newStatus = true;
        }
        else {
            this.iterations = toSet;
            this.elements.alerts.iterations.innerHTML = "";
            this.harmonizeItersAndIPC("iterations");
        }
        this.inputStatus.iterations = newStatus;
    },

    // Sets internal and displayed iterations 
    setIterations(iterations) {
        this.iterations = iterations;
        this.displayIterations();
    },

    // When iteration increment input is changed
    updateIterationIncrement() {
        let toSet = Number(this.elements.iterationIncrement.value);

        // Sanitize
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.iterationIncrement.innerHTML =
                "Iteration increment must be a number";
            newStatus = false;
        }
        else if(!Number.isInteger(toSet)) {
            this.elements.alerts.iterationIncrement.innerHTML =
                "Iteration increment must be an integer";
            newStatus = false;
        }
        else {
            this.iterationIncrement = toSet;
            this.elements.alerts.iterationIncrement.innerHTML = "";
        }
        this.inputStatus.iterationIncrement = newStatus;
    },

    // For +iterations button
    increaseIterations() {
        this.setIterations(this.iterations + this.iterationIncrement);
        this.harmonizeItersAndIPC("iterations");
    },

    // For -iterations button
    decreaseIterations() {
        this.setIterations(this.iterations - this.iterationIncrement);
        this.harmonizeItersAndIPC("iterations");
    },


    // Escape radius
    updateEscapeRadius() {
        let toSet = Number(this.elements.escapeRadius.value);

        // Sanitize
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.escapeRadius.innerHTML =
                "Escape radius must be a number";
                newStatus = false;
        }
        else if(toSet < 2) {
            this.elements.alerts.escapeRadius.innerHTML =
                "Escape radius must be at least 2";
            newStatus = false;
        }
        else {
            this.escapeRadius = toSet;
            this.elements.alerts.escapeRadius.innerHTML = "";
        }
        this.inputStatus.escapeRadius = newStatus;
    },



    // Zoom

    // Match internal and external zoom with current image
    updateZoom() {
        this.elements.zoom.innerHTML = currImg.frame.toZoom();
    },

    // When zoom reset button is pressed
    resetZoom() {
        // Get the default image for the current fractal
        let def = defaultImages[currImg.fractal.type];

        // Give the current image these default parameters
        // (because deep zooms often have differing parameters from shallow zooms)
        currImg.setFrame(def.frame);
        currImg.iterations = def.iterations;
        currImg.escapeRadius = def.escapeRadius;
        currImg.itersPerCycle = def.itersPerCycle;

        // Match external toolbar input elements
        this.matchImageParams();

        // Redraw the image
        this.redraw();

        // Display the updated zoom
        this.updateZoom();
    },

    // When click zoom factor input is changed
    updateCZF() {
        let toSet = Number(this.elements.clickZoomFactor.value);

        // Sanitize
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.clickZoomFactor.innerHTML =
                "Click zoom factor must be a number";
            newStatus = false;
        }
        else if(toSet <= 0) {
            this.elements.alerts.clickZoomFactor.innerHTML =
                "Click zoom factor must be positive";
            newStatus = false;
        }
        else {
            this.clickZoomFactor = toSet;
            this.elements.alerts.clickZoomFactor.innerHTML = "";
            this.inputStatus.clickZoomFactor = true;
        }
        this.inputStatus.clickZoomFactor = newStatus;
    },


    // Smooth coloring
    updateSmoothColoring() {
        this.smoothColoring = this.elements.smoothColoring.checked;
    },

    // Gradient
    updateGradient() {
        let toSet;

        try {
            toSet = new Gradient(this.elements.gradient.value);
        }
        catch(e) {
            this.elements.alerts.gradient.innerHTML =
                "There is an error in the gradient";
            this.inputStatus.gradient = false;
            return;
        }

        this.elements.alerts.gradient.innerHTML = "";
        this.gradient = toSet;
        this.drawGradient();
        this.inputStatus.gradient = true;
    },

    drawGradient() {
        let w = this.elements.gradientCanvas.width;
        for(let x = 0; x < w; x++) {
            let color = Gradient.getColorAt(this.gradient, x / w);
            this.gradientCanvasCtx.fillStyle = 
                `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            this.gradientCanvasCtx.fillRect(x, 0, 1, this.elements.gradientCanvas.width);
        }
    },

    // When iterations per cycle input is changed
    updateIPC() {
        let toSet = Number(this.elements.itersPerCycle.value);

        // Sanitize
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.itersPerCycle.innerHTML =
                "Iterations per cycle must be a number";
            newStatus = false;
        }
        else if(toSet < 2) {
            this.elements.alerts.itersPerCycle.innerHTML =
                "Iterations per cycle must be at least 2";
            newStatus = false;
        }
        else if(!Number.isInteger(toSet)) {
            this.elements.alerts.itersPerCycle.innerHTML =
                "Iterations per cycle must be an integer";
            newStatus = false;
        }
        else {
            this.itersPerCycle = toSet;
            this.harmonizeItersAndIPC("itersPerCycle");
            this.elements.alerts.itersPerCycle.innerHTML = "";
        }
        this.inputStatus.itersPerCycle = newStatus;
    },

    setItersPerCycle(itersPerCycle) {
        this.itersPerCycle = itersPerCycle;
        this.elements.itersPerCycle.value = itersPerCycle;
    },

    setImgGradient() {
        currImg.gradient = this.gradient;
        currImg.itersPerCycle = this.itersPerCycle;
    },

    harmonizeItersAndIPC(priority) {
        if(this.iterations < this.itersPerCycle) {
            if(priority == "iterations") {
                this.setItersPerCycle(this.iterations);
            }
            else {
                this.setIterations(this.itersPerCycle);
            }
        }
    },



    // Canvas dimensions
    updateCanvasWidth() {
        let toSet = Number(this.elements.canvasWidth.value);

        // Sanitize
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.canvasWidth.innerHTML =
                "Canvas width must be a number";
            newStatus = false;
        }
        else if(toSet < 1) {
            this.elements.alerts.canvasWidth.innerHTML =
                "Canvas width must be positive";
            newStatus = false;
        }
        else if(!Number.isInteger(toSet)) {
            this.elements.alerts.canvasWidth.innerHTML =
                "Canvas width must be an integer";
            newStatus = false;
        }
        else {
            this.canvasWidth = toSet;
            this.elements.alerts.canvasWidth.innerHTML = "";
        }
        this.inputStatus.canvasWidth = newStatus;
    },

    updateCanvasHeight() {
        let toSet = Number(this.elements.canvasHeight.value);

        // Sanitize
        let newStatus = true;
        if(Number.isNaN(toSet)) {
            this.elements.alerts.canvasHeight.innerHTML =
                "Canvas height must be a number";
            newStatus = false;
        }
        else if(toSet < 1) {
            this.elements.alerts.canvasHeight.innerHTML =
                "Canvas height must be positive";
            newStatus = false;
        }
        else if(!Number.isInteger(toSet)) {
            this.elements.alerts.canvasHeight.innerHTML =
                "Canvas height must be an integer";
            newStatus = false;
        }
        else {
            this.canvasHeight = toSet;
            this.elements.alerts.canvasHeight.innerHTML = "";
        }
        this.inputStatus.canvasHeight = newStatus;
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
        
        // Update fractal and check for changes
        if(this.fractalType != this.lastFractalType) {
            currImg = defaultImages[this.fractalType].copy();
            fractalChanged = true;
        }

        // Update exponent and check for changes
        if(currImg.fractal.requiresExponent) {
            currImg.fractal.params.e = this.exponent;

            // If exponent has changed, return to original frame
            // (i.e. don't stay zoomed in, same for Julia constant below)
            if(this.exponent != this.lastExponent) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        // Update Julia constant and check for changes
        if(currImg.fractal.requiresJuliaConstant) {
            currImg.fractal.params.c = this.juliaConstant;
            if(!Complex.equals(this.juliaConstant, this.lastJuliaConstant)) {
                currImg.setFrame(defaultView);
                fractalChanged = true;
            }
        }

        if(fractalChanged) {
            // New image takes priority for parameters
            this.matchImageParams();

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

            // Update image smooth coloring
            currImg.smoothColoring = this.smoothColoring;
        }

        // Update last fractal parameters for future checks
        this.lastFractalType = this.fractalType;
        this.lastExponent = this.exponent;
        this.lastJuliaConstant = this.juliaConstant;

        // Update gradient and ipc
        this.setImgGradient();

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



    // Matching - changing internals to match the current image
    matchFractal() {
        // Match fractal type

        // Manually set fractal type input and update
        // internals accordingly, a little dirty...
        this.elements.fractalType.value = currImg.fractal.type;
        this.updateFractalType();

        let currFractal = currImg.fractal;
        this.fractalType = currFractal;
        this.lastFractalType = currFractal;

        // Match Exponent
        if(currFractal.params.e) {
            this.elements.exponent.value = currFractal.params.e;
            this.exponent = this.lastExponent = currFractal.params.e;
        }

        // Match Julia constant
        if(currFractal.params.c) {
            this.elements.juliaConstant.value = Complex.toString(currImg.fractal.params.c);
            this.juliaConstant = this.lastJuliaConstant = currFractal.params.c;
        }
    },

    matchImageParams() {
        // Match iterations
        this.elements.iterations.value = currImg.iterations;
        this.iterations = currImg.iterations;

        // Match escape radius
        this.elements.escapeRadius.value = currImg.escapeRadius;
        this.escapeRadius = currImg.escapeRadius;

        // Match smooth coloring
        this.elements.smoothColoring.checked = currImg.smoothColoring;
        this.smoothcoloring = currImg.smoothColoring;

        // Match IPC
        this.elements.itersPerCycle.value = currImg.itersPerCycle;
        this.itersPerCycle = currImg.itersPerCycle;
        
        // Match zoom
        this.updateZoom();
    },

    clearErrors() {
        for(let key in this.elements.alerts) {
            this.elements.alerts[key].innerHTML = "";
        }
        for(let key in this.inputStatus) {
            this.inputStatus[key] = true;
        }
    }
};
