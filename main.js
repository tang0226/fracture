// Custom modules/libraries used here (canvas and Math)
// are imported from the HTML document, main.html.
// Core files (image, frame, etc.) have been imported as well

setCanvasDim(600, 600);
noStroke();

colorMode("HSL");


// Complex numbers

var Complex = function(re, im) {
	return {
		re: re,
		im: im
	};
};

Complex.add = function(c1, c2) {
	return Complex(c1.re + c2.re, c1.im + c2.im);
},

Complex.sub = function(c1, c2) {
	return Complex(c1.re - c2.re, c1.im - c2.im);
},

Complex.mul = function(c1, c2) {
	return Complex(
		c1.re * c2.re - c1.im * c2.im,
		c1.re * c2.im + c1.im * c2.re
	);
},

Complex.div = function(c1, c2) {
	return Complex(
		(c1.re * c2.re + c1.im * c2.im) / (c2.re * c2.re + c2.im * c2.im),
		(c1.im * c2.re - c1.re * c2.im) / (c2.re * c2.re + c2.im * c2.im)
	);
},

Complex.exp = function(c, e) {
	if(e == 1){
		return c;
	}
	return complex.mul(c, c.exp(e - 1));
},

Complex.abs = function(c) {
	return (c.re * c.re + c.im * c.im) ** 0.5;
}



/******************************
FRACTAL PROTOTYPES: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE:
Julia
MultiJulia
Mandelbrot
Multibrot
Burning Ship
MultiShip
BS Julia
******************************/ 
{
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
}



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
			this.reMin + (this.reWidth * x / WIDTH),
			this.imMin + (this.imHeight * y / HEIGHT)
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
	
	this.reIter = frame.reWidth / WIDTH;
	this.imIter = frame.imHeight / HEIGHT;
	
	this.currY = 0;
	this.currIm = frame.imMin;
	
	this.drawing = true;
	this.startTime = null;
	this.renderTime = null;
	
	this.drawLayer = function() {
		let currRe = this.frame.reMin;
		for(let currX = 0; currX < WIDTH; currX++) {
			let c = Complex(currRe, this.currIm);
			let val = this.fractal.iterate(c, this.iterations);
			
			if(val == this.iterations) {
				fill(0, 0, 0);
			}
			else {
				// Color pallettes; need to generalize
				//var col = scale(val, 0, this.iterations, 0, 255)
				// BW: fill(scale(val, 0, this.iterations, 0, 255));
				fill(scale(val, 0, this.iterations, 0, 360), 100, scale(val, 0, this.iterations, 0, 100));
				// HSL: fill(scale(val, 0, this.iterations, 0, 360), 100, 50);
				// fill(scale(val, 0, this.iterations, 0, 255), scale(val, 0, this.iterations, 0, 255), scale(val, 0, this.iterations, 0, 255));
			}
			
			rect(currX, this.currY, 1, 1);
			
			currRe += this.reIter;
		};
		
		this.currY += 1;
		this.currIm += this.imIter;
		
		if(this.currY > WIDTH) {
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



// Fractals
var mandelbrot = new Mandelbrot();



// Frames
var defaultView = new Frame(Complex(0, 0), 4, 4);



// Images
var img1 = new Image(mandelbrot, 100, defaultView)


// Initial image settings:
// Try different samples with different image numbers imgX(X)
var currImg = img1;
var imgs = [];



var toolbar = {
	renderTimeId: "render-time",
	mouseComplexCoordsId: "mouse-complex-coords",
	iterationsId: "iterations",
	iterationIncrementId: "iteration-increment",
	zoomId: "zoom",
	clickZoomFactorId: "click-zoom-factor",

	// For currently undefined variables
	init: function() {
		this.iterations = currImg.iterations;
		this.zoom = Number.parseFloat(1 / currImg.frame.reWidth).toExponential(10);
		this.displayMouseComplexCoords();
	},

	displayRenderTime: function(time) {
		document.getElementById(this.renderTimeId).innerHTML =
			"Render time: " +
			(time.getUTCSeconds() * 1000 + time.getUTCMilliseconds()).toString() + " ms";
	},

	getIterationIncrement: function() {
		return Number(document.getElementById(this.iterationIncrementId).value);
	},

	getClickZoomFactor: function() {
		return Number(document.getElementById(this.clickZoomFactorId).value);
	},


	displayMouseComplexCoords: function() {
		let toSet = "";
		if(mouseX == null && mouseY == null) {
			toSet = "N/A";
		}
		else {
			let complexCoords = currImg.frame.toComplexCoords(mouseX, mouseY);
			let complexRe = complexCoords.re.toString();
			let complexIm = complexCoords.im.toString();
			if(Number(complexIm) >= 0) {
				complexIm = "+" + complexIm;
			}
			toSet = complexRe + complexIm + "i";
		}
		document.getElementById(this.mouseComplexCoordsId).innerHTML = "Mouse coordinates: " + toSet;
	},

	displayIterations: function() {
		document.getElementById(this.iterationsId).innerHTML = "Iterations: " + this.iterations.toString();
	},
	
	displayZoom: function() {
		document.getElementById(this.zoomId).innerHTML = "Zoom: " + this.zoom.toString();
	},

	setZoom: function(zoom) {
		this.zoom = zoom;
		this.displayZoom();
	},

	increaseIters: function() {
		this.iterations += this.getIterationIncrement();
		currImg.iterations = this.iterations;
		currImg.reset();
		this.displayIterations();
		startImage(currImg);
	},

	decreaseIters: function() {
		this.iterations -= this.getIterationIncrement();
		currImg.iterations = this.iterations;
		currImg.reset();
		this.displayIterations();
		startImage(currImg);
	}
};



// Mouse variables
var mouseX = null;
var mouseY = null;
var startDragX = null;
var startDragY = null;
var mouseDown = false;


// Mouse Events

var mousePressed = function(event) {
	if(event.buttons == 1) {
		if(!mouseDown) {
			startDragX = mouseX;
			startDragY = mouseY;
		}
		mouseDown = true;
	}
};


// Based on mouse coordinates, calculate the frame for the new image and start it
var mouseReleased = function() {
	if(mouseDown) {
		mouseDown = false;
		currImg.reset();

		let newFrame;
		if(mouseX == startDragX && mouseY == startDragY) {
			let zoomFactor = toolbar.getClickZoomFactor();
			let xOffset = mouseX - (WIDTH / 2);
			let yOffset = mouseY - (HEIGHT / 2);
			let newReWidth = currImg.frame.reWidth / zoomFactor;
			let newImHeight = currImg.frame.imHeight / zoomFactor;
			let newReIter = newReWidth / WIDTH;
			let newImIter = newImHeight / HEIGHT;
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


var mouseMoved = function(event) {
	mouseX = event.offsetX;
	mouseY = event.offsetY;
	toolbar.displayMouseComplexCoords();
};


var mouseOut = function() {
	document.getElementById("mouse-complex-coords").innerHTML = "Mouse coordinates: N/A";
};



// Initialize events (canvas library function)
addEvent("mousedown", mousePressed);
addEvent("mouseup", mouseReleased);
addEvent("mousemove", mouseMoved);
addEvent("mouseout", mouseOut);



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