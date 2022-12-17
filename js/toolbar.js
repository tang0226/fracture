/******************************
TOOLBAR OBJECT
******************************/ 

var toolbar = {
    // Elements
    renderTimeElement: document.getElementById("render-time"),
    mouseComplexCoordsElement: document.getElementById("mouse-complex-coords"),
    fractalTypeElement: document.getElementById("fractal-type"),
    exponentContainer: document.getElementById("exponent-container"),
    exponentElement: document.getElementById("exponent"),
    juliaConstantContainer: document.getElementById("julia-constant-container"),
    juliaConstantElement: document.getElementById("julia-constant"),
    iterationsElement: document.getElementById("iterations"),
    iterationIncrementElement: document.getElementById("iteration-increment"),
    zoomElement: document.getElementById("zoom"),
    clickZoomFactorElement: document.getElementById("click-zoom-factor"),

    
    // For currently undefined variables
    init: function() {
        this.fractalType = this.lastFractalType = currImg.getFractalType();
        this.exponent = this.lastExponent = currImg.fractal.e || null;
        this.juliaConstant = this.lastJuliaConstant = currImg.fractal.c || Complex(null, null);
        this.iterations = currImg.iterations;
        this.zoom = currImg.frame.toZoom();
        this.clickZoomFactor = Number(this.clickZoomFactorElement.value);
        this.resetMouseComplexCoords();
        this.displayIterations();
        this.updateZoom();
    },


    // Render time
    displayRenderTime: function(time) {
        this.renderTimeElement.innerHTML = (time.getUTCSeconds() * 1000 + time.getUTCMilliseconds()).toString();
    },


    // Mouse complex coordinates
    displayMouseComplexCoords: function() {
        let complexCoords = currImg.frame.toComplexCoords(mouseX, mouseY);
        let complexRe = complexCoords.re.toString();
        let complexIm = complexCoords.im.toString();
        if(Number(complexIm) >= 0) {
            complexIm = "+" + complexIm;
        }
        this.mouseComplexCoordsElement.innerHTML = complexRe + complexIm + "i";
    },

    resetMouseComplexCoords: function() {
        this.mouseComplexCoordsElement.innerHTML = "N/A";
    },



    // Fractal

    // When fractal select is changed
    updateInternalFractalType: function() {
        // Set internal fractal type
        this.fractalType = this.fractalTypeElement.value;

        // Show exponent and Juila constant inputs where applicable
        if(requiresExponent(this.fractalType)) {
            this.exponentContainer.className = "";
        }
        else {
            this.exponentContainer.className = "hide";
        }
        if(requiresJuliaConstant(this.fractalType)) {
            this.juliaConstantContainer.className = "";

        }
        else {
            this.juliaConstantContainer.className = "hide";
        }
    },

    // When exponent input is changed
    updateInternalExponent: function() {
        this.exponent = Number(this.exponentElement.value);
    },

    // When Julia constant input is changed
    updateInternalJuliaConstant: function() {
        this.juliaConstant = Complex.parseString(this.juliaConstantElement.value);
    },



    // Iterations

    // Display internal iterations
    displayIterations: function() {
        this.iterationsElement.value = this.iterations.toString();
    },

    // When iterations input is changed
    updateInternalIterations: function() {
        this.iterations = Number(this.iterationsElement.value);
    },

    // Set internal and displayed iterations 
    setIterations: function(iterations) {
        this.iterations = iterations;
        this.displayIterations();
    },

    // Get iteration increment input
    getIterationIncrement: function() {
        return Number(this.iterationIncrementElement.value);
    },

    // For +iterations button
    increaseIterations: function() {
        this.setIterations(this.iterations + this.getIterationIncrement());
    },

    // For -iterations button
    decreaseIterations: function() {
        this.setIterations(this.iterations - this.getIterationIncrement());
    },



    // Zoom

    // Sync internal and external zoom with current image
    updateZoom: function() {
        let zoom = currImg.frame.toZoom();
        this.zoom = zoom;
        this.zoomElement.innerHTML = this.zoom.toString();
    },

    // When click zoom factor input is changed
    updateInternalCZF: function() {
        this.clickZoomFactor = Number(this.clickZoomFactorElement.value);
    },



    // Redraw
    redrawImage: function() {
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
        currImg.reset();
    },



    // Sync
    syncWithImage: function() {
        // Sync fractal type

        // Manually set fractal type input and update
        // internals accordingly, a little dirty...
        this.fractalTypeElement.value = currImg.getFractalType();
        this.updateInternalFractalType();

        let currFractal = currImg.fractal;
        this.fractalType = currFractal;
        this.lastFractalType = currFractal;

        // Sync Exponent
        if(currFractal.e) {
            this.exponentElement.value = currFractal.e.toString();
            this.exponent = this.lastExponent = currFractal.e;
        }

        // Sync Julia constant
        if(currFractal.c) {
            this.juliaConstantElement.value = Complex.toString(currImg.fractal.c);
            this.juliaConstant = this.lastJuliaConstant = currFractal.c;
        }

        // Sync iterations
        this.iterationsElement.value = currImg.iterations.toString();
        this.iterations = currImg.iterations;
        
        // Sync zoom
        this.updateZoom();
    }
};
