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



// Complex numbers

var Complex = function(re, im) {
    return {
        re: re,
        im: im
    };
};

Complex.toString = function(c) {
    let string = c.re.toString();
    if(c.im >= 0) {
        string += "+";
    }
    return string + c.im.toString();
};

Complex.parseString = function(s) {
    let match = s.match(/(-?\d(\.\d+)?)((\+|-)\d(\.\d+)?)i/);
    if(match) {
        return Complex(Number(match[1]), Number(match[3]));
    }
};

Complex.equals = function(c1, c2) {
    return c1.re == c2.re && c1.im == c2.im;
};

Complex.add = function(c1, c2) {
    return Complex(c1.re + c2.re, c1.im + c2.im);
};

Complex.sub = function(c1, c2) {
    return Complex(c1.re - c2.re, c1.im - c2.im);
};

Complex.mul = function(c1, c2) {
    return Complex(
        c1.re * c2.re - c1.im * c2.im,
        c1.re * c2.im + c1.im * c2.re
    );
};

Complex.div = function(c1, c2) {
    return Complex(
        (c1.re * c2.re + c1.im * c2.im) / (c2.re * c2.re + c2.im * c2.im),
        (c1.im * c2.re - c1.re * c2.im) / (c2.re * c2.re + c2.im * c2.im)
    );
};

Complex.sq = function(c) {
    return Complex(
        c.re ** 2 - c.im ** 2,
        2 * c.re * c.im
    );
};

Complex.exp = function(c, e) {
    let r = c;
    let currE = 1;
    while(currE < e) {
        r = Complex.mul(r, c);
        currE++;
    }
    return r;
};

Complex.abs = function(c) {
    return (c.re ** 2 + c.im ** 2) ** 0.5;
};



/******************************
FRACTAL PROTOTYPES: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE:
******************************/ 
var Mandelbrot = function() {
    this.iterate = function(c, iterations) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.mul(z, z), c);
            n++;
        }
        return n;
    };
};

var Julia = function(c) {
    this.c = c;

    this.iterate = function(_z, iterations) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.mul(z, z), this.c);
            n++;
        }
        return n;
    };
};

var Multibrot = function(e) {
    this.e = e;

    this.iterate = function(c, iterations) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.exp(z, this.e), c);
            n++;
        }
        return n;
    };
};

var Multijulia = function(e, c) {
    this.e = e;
    this.c = c;
    
    this.iterate = function(_z, iterations) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.exp(z, this.e), this.c);
            n++;
        }
        return n;
    };
};

var BurningShip = function() {
    this.iterate = function(c, iterations) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.exp(Complex(abs(z.re), abs(z.im)), 2), c);
            n++;
        }
        return n;
    };
};

var BurningShipJulia = function(c) {
    this.c = c;

    this.iterate = function(_z, iterations) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.exp(Complex(abs(z.re), abs(z.im)), 2), this.c);
            n++;
        }
        return n;
    };
};

var Multiship = function(e) {
    this.e = e;

    this.iterate = function(c, iterations) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.exp(Complex(abs(z.re), abs(z.im)), this.e), c);
            n++;
        }
        return n;
    };
};

var MultishipJulia = function(e, c) {
    this.e = e;
    this.c = c;
    
    this.iterate = function(_z, iterations) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= 2 && n < iterations) {
            z = Complex.add(Complex.exp(Complex(abs(z.re), abs(z.im)), this.e), this.c);
            n++;
        }
        return n;
    };
};


var requiresExponent = function(fractalType) {
    return [
        "Multibrot",
        "Multijulia",
        "Multiship",
        "MultishipJulia"
    ].includes(fractalType);
};

var requiresJuliaConstant = function(fractalType) {
    return [
        "Julia",
        "Multijulia",
        "BurningShipJulia",
        "MultishipJulia"
    ].includes(fractalType);
};


/******************************
FRAME PROTOTYPE: REGION ON THE COMPLEX PLANE
******************************/
var Frame = function(center, reWidth, imHeight) {
    this.center = center;
    this.reWidth = reWidth;
    this.imHeight = imHeight;
    this.reMin = this.center.re - reWidth / 2;
    this.reMax = this.center.re + reWidth / 2;
    this.imMin = this.center.im - imHeight /2;
    this.imMax = this.center.im + imHeight / 2;

    this.toComplexCoords = function(x, y){
        return Complex(
            this.reMin + (this.reWidth * x / _width),
            this.imMin + (this.imHeight * y / _height)
        );
    };

    this.toZoom = function() {
        return Number.parseFloat(1 / this.reWidth).toExponential(10)
    };
};



/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, REGION, AND CANVAS SIZE
******************************/
var Image = function(fractal, iterations, frame) {
    this.fractal = fractal;
    this.iterations = iterations;

    this.frame = frame;
    
    this.reIter = frame.reWidth / _width;
    this.imIter = frame.imHeight / _height;
    
    this.currY = 0;
    this.currIm = frame.imMin;
    
    this.drawing = true;
    this.startTime = null;
    this.renderTime = null;
    
    this.getFractalType = function() {
        return this.fractal.constructor.name;
    };

    this.setFrame = function(frame) {
        this.frame = frame;
        this.reIter = frame.reWidth / _width;
        this.imIter = frame.imHeight / _height;
    };

    this.drawLayer = function() {
        let currRe = this.frame.reMin;
        for(let currX = 0; currX < _width; currX++) {
            let c = Complex(currRe, this.currIm);
            let val = this.fractal.iterate(c, this.iterations);
            
            if(val == this.iterations) {
                canvas.fillStyle = hsl(0, 0, 0);
            }
            else {
                canvas.fillStyle = hsl(scale(val, 0, this.iterations, 0, 360), 100, scale(val, 0, this.iterations, 0, 100));
            }
            
            canvas.fillRect(currX, this.currY, 1, 1);
            
            currRe += this.reIter;
        };
        
        this.currY += 1;
        this.currIm += this.imIter;
        
        if(this.currY > _width) {
            this.drawing = false;
        }
        this.renderTime = new Date(new Date() - this.startTime);
        toolbar.displayRenderTime(this.renderTime);
    };
    
    this.reset = function() {
        this.currY = 0;
        this.currIm = this.frame.imMin;
        this.drawing = true;
        this.startTime = new Date();
    };

    this.copy = function() {
        return new Image(this.fractal, this.iterations, this.frame);
    };
};



// Toolbar
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
        this.fractalType = currImg.getFractalType();
        this.exponent = currImg.fractal.e;
        this.juliaConstant = currImg.fractal.c;
        this.lastFractalType = currImg.getFractalType();
        this.lastExponent = currImg.fractal.e || null;
        this.lastJuliaConstant = currImg.fractal.c || Complex(null, null);
        this.iterations = currImg.iterations;
        this.zoom = currImg.frame.toZoom();
        this.resetMouseComplexCoords();
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
    updateFractal: function() {
        this.fractalType = this.fractalTypeElement.value;
        this.displayFractalParameters();
    },

    displayFractalParameters: function() {
        let fractalType = this.fractalTypeElement.value;
        if(requiresExponent(fractalType)) {
            this.exponentContainer.className = "";
        }
        else {
            this.exponentContainer.className = "hide";
        }
        if(requiresJuliaConstant(fractalType)) {
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

    updateIterations: function(iterations) {
        this.iterations = iterations;
        this.displayIterations();
    },

    getIterationIncrement: function() {
        return Number(this.iterationIncrementElement.value);
    },

    increaseIterations: function() {
        this.updateIterations(this.iterations + this.getIterationIncrement());
    },

    decreaseIterations: function() {
        this.updateIterations(this.iterations - this.getIterationIncrement());
    },

    updateInternalIterations: function() {
        this.iterations = Number(this.iterationsElement.value);
    },


    // Zoom
    updateZoom: function() {
        let zoom = currImg.frame.toZoom();
        this.zoom = zoom;
        this.zoomElement.innerHTML = this.zoom.toString();
    },
    
    getClickZoomFactor: function() {
        return Number(this.clickZoomFactorElement.value);
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
        restartImage(currImg);
    }
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
canvasElement.onmouseup = function(event) {
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
            let zoomFactor = toolbar.getClickZoomFactor();
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

    currImg.setFrame(newFrame);

    toolbar.updateZoom();

    restartImage(currImg);

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



// Select an image to draw and start drawing it
var restartImage = function() {
    currImg.reset();
    toolbar.displayIterations();
    toolbar.updateZoom();
};



// Draw loop
var draw = function() {
    if(currImg.drawing) {
        currImg.drawLayer();
    };
    setTimeout(draw, 0);
};



// Run:
toolbar.init();
restartImage(currImg);
draw();
