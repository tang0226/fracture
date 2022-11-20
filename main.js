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
}

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
    }
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
    }
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
};



// Frames
var defaultView = new Frame(Complex(0, 0), 4, 4);



// Images
var defaultImages = {
    mandelbrot: new Image(new Mandelbrot(), 100, new Frame(Complex(-0.5, 0), 4, 4)),
    julia: new Image(new Julia(Complex(-0.8, 0.156)), 200, defaultView),
    multibrot: new Image(new Multibrot(3), 100, defaultView),
    multijulia: new Image(new Multijulia(3, Complex(-0.12, -0.8)), 100, defaultView),
    burningShip: new Image(new BurningShip(), 100, new Frame(Complex(0, -0.5), 4, 4)),
    burningShipJulia: new Image(new BurningShipJulia(Complex(-1.5, 0)), 100, defaultView),
    multiship: new Image(new Multiship(3), 100, defaultView),
    multishipJulia: new Image(new MultishipJulia(3, Complex(-1.326667, 0)), 100, defaultView)
};


// Initial image settings:
var currImg = defaultImages.mandelbrot;




// Toolbar
var toolbar = {
    renderTimeId: "render-time",
    mouseComplexCoordsId: "mouse-complex-coords",
    fractalTypeId: "fractal-type",
    iterationsId: "iterations",
    iterationIncrementId: "iteration-increment",
    zoomId: "zoom",
    clickZoomFactorId: "click-zoom-factor",

    fractalType: "mandelbrot",
    
    // For currently undefined variables
    init: function() {
        this.iterations = currImg.iterations;
        this.zoom = Number.parseFloat(1 / currImg.frame.reWidth).toExponential(10);
        this.resetMouseComplexCoords();
    },


    // Render time
    displayRenderTime: function(time) {
        document.getElementById(this.renderTimeId).innerHTML = (time.getUTCSeconds() * 1000 + time.getUTCMilliseconds()).toString();
    },


    // Mouse complex coordinates
    displayMouseComplexCoords: function() {
        let complexCoords = currImg.frame.toComplexCoords(mouseX, mouseY);
        let complexRe = complexCoords.re.toString();
        let complexIm = complexCoords.im.toString();
        if(Number(complexIm) >= 0) {
            complexIm = "+" + complexIm;
        }
        document.getElementById(this.mouseComplexCoordsId).innerHTML = complexRe + complexIm + "i";
    },

    resetMouseComplexCoords: function() {
        document.getElementById(this.mouseComplexCoordsId).innerHTML = "N/A";
    },


    // Iterations
    displayIterations: function() {
        document.getElementById(this.iterationsId).value = this.iterations.toString();
    },

    getIterationIncrement: function() {
        return Number(document.getElementById(this.iterationIncrementId).value);
    },

    increaseIterations: function() {
        this.iterations += this.getIterationIncrement();
        this.displayIterations();
    },

    decreaseIterations: function() {
        this.iterations -= this.getIterationIncrement();
        this.displayIterations();
    },

    syncIterations: function() {
        this.iterations = Number(document.getElementById(this.iterationsId).value);
    },


    // Zoom
    displayZoom: function() {
        document.getElementById(this.zoomId).innerHTML = this.zoom.toString();
    },

    setZoom: function(zoom) {
        this.zoom = zoom;
        this.displayZoom();
    },
    
    getClickZoomFactor: function() {
        return Number(document.getElementById(this.clickZoomFactorId).value);
    },


    // Redraw
    redrawImage: function() {
        let fractalType = document.getElementById(this.fractalTypeId).value;
        if(fractalType != this.fractalType) {
            currImg = defaultImages[document.getElementById(this.fractalTypeId).value];
            this.fractalType = fractalType;
            this.iterations = currImg.iterations;
            this.displayIterations();
        }
        else{
            currImg.iterations = this.iterations;
        }
        currImg.reset();
        startImage(currImg);
        this.displayingDefault = false;
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
canvasElement.onmouseup = function() {
    if(mouseDown) {
        mouseDown = false;
        currImg.reset();

        let newFrame;
        if(mouseX == startDragX && mouseY == startDragY) {
            let zoomFactor = toolbar.getClickZoomFactor();
            let xOffset = mouseX - (_width / 2);
            let yOffset = mouseY - (_height / 2);
            let newReWidth = currImg.frame.reWidth / zoomFactor;
            let newImHeight = currImg.frame.imHeight / zoomFactor;
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

        currImg = new Image(
            currImg.fractal,
            currImg.iterations,
            newFrame
        );
        toolbar.setZoom(Number.parseFloat(1 / currImg.frame.reWidth).toExponential(10));

        startImage(currImg);

        startDragX = null;
        startDragY = null;
    }
};


canvasElement.onmousemove = function(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
    toolbar.displayMouseComplexCoords();
};


canvasElement.onmouseout = function() {
    toolbar.resetMouseComplexCoords();
};



// Select an image to draw and start drawing it
var startImage = function(img) {
    currImg = img;
    currImg.reset();
    toolbar.displayIterations();
    toolbar.displayZoom();
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
startImage(currImg);
draw();
