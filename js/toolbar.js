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
    updateInternalFractalType: function() {
        this.fractalType = this.fractalTypeElement.value;
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

    updateInternalExponent: function() {
        this.exponent = Number(this.exponentElement.value);
    },

    updateInternalJuliaConstant: function() {
        this.juliaConstant = Complex.parseString(this.juliaConstantElement.value);
    },


    // Iterations
    displayIterations: function() {
        this.iterationsElement.value = this.iterations.toString();
    },

    updateInternalIterations: function() {
        this.iterations = Number(this.iterationsElement.value);
    },

    setIterations: function(iterations) {
        this.iterations = iterations;
        this.displayIterations();
    },

    getIterationIncrement: function() {
        return Number(this.iterationIncrementElement.value);
    },

    increaseIterations: function() {
        this.setIterations(this.iterations + this.getIterationIncrement());
    },

    decreaseIterations: function() {
        this.setIterations(this.iterations - this.getIterationIncrement());
    },


    // Zoom
    updateZoom: function() {
        let zoom = currImg.frame.toZoom();
        this.zoom = zoom;
        this.zoomElement.innerHTML = this.zoom.toString();
    },

    updateInternalCZF: function() {
        this.clickZoomFactor = Number(this.clickZoomFactorElement.value);
    },


    // Redraw
    redrawImage: function() {
        if(this.fractalType != this.lastFractalType) {
            currImg = defaultImages[this.fractalType].copy();
        }
        if(requiresExponent(currImg.getFractalType())) {
            currImg.fractal.e = this.exponent;
            if(this.exponent != this.lastExponent) {
                currImg.setFrame(defaultView);
            }
        }
        if(requiresJuliaConstant(currImg.getFractalType())) {
            currImg.fractal.c = this.juliaConstant;
            if(!Complex.equals(this.juliaConstant, this.lastJuliaConstant)) {
                currImg.setFrame(defaultView);
            }
        }
        this.lastFractalType = this.fractalType;
        this.lastExponent = this.exponent;
        this.lastJuliaConstant = this.juliaConstant;
        currImg.iterations = this.iterations;
        currImg.reset();
    }
};
