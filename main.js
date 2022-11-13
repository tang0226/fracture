// Custom modules/libraries used here (canvas and Math)
// are imported from the HTML document, main.html.
// Core files (image, frame, etc.) have been imported as well

setCanvasDim(600, 600);
noStroke();

colorMode("HSL");


// Complex number prototype
var Complex = function(re, im) {
	this.re = re;
	this.im = im;
	
	this.add = function(c) {
		return new Complex(this.re + c.re, this.im + c.im);
	};

	this.sub = function(c) {
		return new Complex(this.re - c.re, this.im - c.im);
	};

	this.mul = function(c) {
		return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re);
	};

	this.div = function(c) {
		return new Complex(
			(this.re * c.re + this.im * c.im) / (c.re ** 2 + c.im ** 2),
			(this.im * c.re - this.re * c.im) / (c.re ** 2 + c.im ** 2)
		);
	};

	this.exp = function(e) {
		if(e == 1){
			return this;
		}
		return this.mul(this.exp(e - 1));
	};
	
	this.abs = function() {
		return hypot(this.re, this.im);
	};
}



/******************************
FRACTAL PROTOTYPES: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE
******************************/ 
{
	var Julia = function(c) {
		this.c = c;
		
		this.f = function(z) {
			return z.mul(z).add(this.c);
		};
		
		this.iterate = function(Z, iterations, smoothColoring) {
			let z = Z;
			let n = 0;
			z = this.f(z);
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(2);
			}
			return n;
		};
	};

	var MultiJulia = function(c, e) {
		this.c = c;
		this.e = e;
		
		this.f = function(z) {
			return z.exp(e).add(this.c);
		};
		
		this.iterate = function(Z, iterations, smoothColoring) {
			let z = Z;
			let n = 0;
			z = this.f(z);
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(this.e);
			}
			return n;
		};
	};

	var Mandelbrot = function() {
		this.f = function(z, c) {
			return z.exp(2).add(c);
		};
		
		this.iterate = function(c, iterations, smoothColoring) {
			let z = new Complex(0, 0);
			let n = 0;
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(2);
			}
			return n;
		};
	};

	var Multibrot = function(e) {
		this.e = e;
		
		this.f = function(z, c) {
			return z.exp(this.e).add(c);
		};
		
		this.iterate = function(c, iterations, smoothColoring) {
			let z = new Complex(0, 0);
			let n = 0;
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(this.e);
			}
			return n;
		};
	};

	var BurningShip = function() {
		this.f = function(z, c) {
			return (new Complex(abs(z.re), abs(z.im))).exp(2).add(c);
		};

		this.iterate = function(c, iterations, smoothColoring) {
			let z = new Complex(0, 0);
			let n = 0;
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(2);
			}
			return n;
		};
	};

	var MultiShip = function(e) {
		this.e = e;
		
		this.f = function(z, c) {
			return (new Complex(abs(z.re), abs(z.im))).exp(this.e).add(c);
		};

		this.iterate = function(c, iterations, smoothColoring) {
			let z = new Complex(0, 0);
			let n = 0;
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(this.e);
			}
			return n;
		};
	};

	var BSJulia = function(c) {
		this.c = c;
		
		this.f = function(z) {
			return (new Complex(abs(z.re), abs(z.im))).exp(2).add(this.c);
		};
		
		this.iterate = function(Z, iterations, smoothColoring) {
			let z = Z;
			let n = 0;
			z = this.f(z);
			while(z.abs() <= 2 && n < iterations) {
				z = this.f(z);
				n++;
			}
			if(n < iterations && smoothColoring) {
				return n + 1 - log(log(z.abs())) / log(2);
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
	this.reMin = center.re - reWidth / 2;
	this.reMax = center.re + reWidth / 2;
	this.imMin = center.im - imHeight /2;
	this.imMax = center.im + imHeight / 2;

	this.toComplexCoords = function(x, y){
		return {
			re: this.reMin + (this.reWidth * x / WIDTH),
			im: this.imMin + (this.imHeight * y / HEIGHT)
		};
	};
};



/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, REGION, AND CANVAS SIZE
******************************/
var Image = function(fractal, iterations, smoothColoring, frame) {
	this.fractal = fractal;
	this.iterations = iterations;
	this.smoothColoring = smoothColoring;

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
			let complex = new Complex(currRe, this.currIm);
			let val = this.fractal.iterate(complex, this.iterations, this.smoothColoring);
			
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
var julia1 = new Julia(new Complex(-0.778, -0.116));
var julia2 = new Julia(new Complex(0.28, 0.008));
var mandel = new Mandelbrot();
var ship = new BurningShip();
var multiShip = new MultiShip(3);
var multiShip2 = new MultiShip(4);
var multi3 = new Multibrot(4);
var multiJulia5 = new MultiJulia(new Complex(0.667, 0.512), 5);
var BSjulia = new BSJulia(new Complex(0.675, -1.15));



// Frames
var defaultView = new Frame(new Complex(0, 0), 4, 4);



// Test image catalog
{
	// Mandelbrot set
	var img1 = new Image(
		mandel, 100, false,
		new Frame(
			new Complex(-0.5, 0),
			4, 4
		),
	);
	// Minibrot, deep zoom into Mandelbrot
	var img2 = new Image(
		mandel, 1000, false,
		new Frame(
			new Complex(0.4422127499646909, 0.23935098947264477),
				0.00000001,
				0.00000001
		),
	);
	// Deep zoom into Burning Ship
	var img3 = new Image(
		ship, 6000, false,
		new Frame(
			new Complex(1.144563047301867, -1.2797276570058733),
				0.000000000001,
				0.000000000001
		),
	);
	// Sample Julia set
	var img4 = new Image(
		julia1, 100, false,
		defaultView,
	);
	// Deep zoom into Mandelbrot
	var img5 = new Image(
		mandel, 2500, false,
		new Frame(
			new Complex(-1.4746396689670118, -0.0000000065964943055555555),
			0.00000000001,
			0.00000000001
		),
	);
	// Multibrot set
	var img6 = new Image(
		multi3, 100, false,
		defaultView,
	);
	// MultiJulia set
	var img7 = new Image(
		multiJulia5, 100, false,
		defaultView,
	);
	// Multi-Burning Ship
	var img8 = new Image(
		multiShip, 100, false,
		defaultView,
	);
	//Burning Ship Armada
	var img9 = new Image(
		ship, 200, false,
		new Frame(
			new Complex(-1.757413194, -0.00657118056),
			0.3,
			0.3
		),
	);
	// Burning Ship Julia Set
	var img10 = new Image(
		BSjulia, 100, false,
		defaultView,
	);
	// Burning Ship
	var img11 = new Image(
		ship, 300, false,
		defaultView,
	);
	// MultiShip 4
	var img12 = new Image(
		multiShip2, 100, false,
		defaultView,
	);
	var img13 = new Image(
		ship, 1000, false,
		new Frame(
			new Complex(-1.770848103815, -0.02849221687),
			1/42836028053,
			1/42836028053,
		),
	);
}


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
		imgs.push(currImg);

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
				new Complex(
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

			let center = new Complex(
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
			currImg.smoothColoring,
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



// Initial image settings:
// Try different samples with different image numbers imgX(X)
var currImg = img1;
var imgs = [];

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