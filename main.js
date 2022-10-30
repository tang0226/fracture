// Custom modules/libraries used here (canvas and Math)
// are imported from the HTML document, main.html

setCanvasDim(600, 600);
noStroke();

colorMode("HSL");

/******************************
FRACTAL PROTOTYPES: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE
******************************/ 
{

	var Julia = function(c) {
		this.c = c;
		
		this.f = function(z) {
			return z.mul(z).add(this.c);
		};
		
		this.iterate = function(Z, iterations) {
			var z = Z;
			var n = 0;
			z = this.f(z);
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z);
				n++;
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
		
		this.iterate = function(Z, iterations) {
			var z = Z;
			var n = 0;
			z = this.f(z);
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z);
				n++;
			}
			return n;
		};
	};

	var Mandelbrot = function() {
		this.f = function(z, c) {
			return z.exp(2).add(c);
		};
		
		this.iterate = function(c, iterations) {
			var z = new Complex(0, 0);
			var n = 0;
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			return n;
		};
	};

	var Multibrot = function(e) {
		this.e = e;
		
		this.f = function(z, c) {
			return z.exp(this.e).add(c);
		};
		
		this.iterate = function(c, iterations) {
			var z = new Complex(0, 0);
			var n = 0;
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			return n;
		};
	};

	var BurningShip = function() {
		this.f = function(z, c) {
			return (new Complex(abs(z.re), abs(z.im))).exp(2).add(c);
		};

		this.iterate = function(c, iterations) {
			var z = new Complex(0, 0);
			var n = 0;
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			return n;
		};
	};

	var MultiShip = function(e) {
		this.e = e;
		
		this.f = function(z, c) {
			return (new Complex(abs(z.re), abs(z.im))).exp(this.e).add(c);
		};

		this.iterate = function(c, iterations) {
			var z = new Complex(0, 0);
			var n = 0;
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z, c);
				n++;
			}
			return n;
		};
	};

	var BSJulia = function(c) {
		this.c = c;
		
		this.f = function(z) {
			return (new Complex(abs(z.re), abs(z.im))).exp(2).add(this.c);
		};
		
		this.iterate = function(Z, iterations) {
			var z = Z;
			var n = 0;
			z = this.f(z);
			while(hypot(z.re, z.im) <= 2 && n < iterations) {
				z = this.f(z);
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
	this.reMin = center.re - reWidth / 2;
	this.reMax = center.re + reWidth / 2;
	this.imMin = center.im - imHeight /2;
	this.imMax = center.im + imHeight / 2;
};


/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, REGION, AND CANVAS SIZE
******************************/
var Image = function(fractal, iterations, frame, width, height) {
	this.fractal = fractal;
	this.iterations = iterations;
	
	this.frame = frame;
	
	this.width = width;
	this.height = height;
	this.reIter = frame.reWidth / width;
	this.imIter = frame.imHeight / height;
	
	this.currY = 0;
	this.currIm = frame.imMin;
	
	this.drawing = true;
	
	this.drawLayer = function() {
		let currRe = this.frame.reMin;
		for(var currX = 0; currX < this.width; currX++) {
			let complex = new Complex(currRe, this.currIm);
			let val = this.fractal.iterate(complex, this.iterations);
			
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
	};
	
	this.reset = function() {
		this.currY = 0;
		this.currIm = this.frame.imMin;
		this.drawing = true;
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
		mandel, 100,
		new Frame(
			new Complex(-0.5, 0),
			4, 4
		),
		WIDTH, HEIGHT
	);
	// Minibrot, deep zoom into Mandelbrot
	var img2 = new Image(
		mandel, 1000,
		new Frame(
			new Complex(0.4422127499646909, 0.23935098947264477),
				0.00000001,
				0.00000001
		),
		WIDTH, HEIGHT
	);
	// Deep zoom into Burning Ship
	var img3 = new Image(
		ship, 6000,
		new Frame(
			new Complex(1.144563047301867, -1.2797276570058733),
				0.000000000001,
				0.000000000001
		),
		WIDTH, HEIGHT
	);
	// Sample Julia set
	var img4 = new Image(
		julia1, 100,
		defaultView,
		WIDTH, HEIGHT
	);
	// Deep zoom into Mandelbrot
	var img5 = new Image(
		mandel, 2500,
		new Frame(
			new Complex(-1.4746396689670118, -0.0000000065964943055555555),
			0.00000000001,
			0.00000000001
		),
		WIDTH, HEIGHT
	);
	// Multibrot set
	var img6 = new Image(
		multi3, 100,
		defaultView,
		WIDTH, HEIGHT
	);
	// MultiJulia set
	var img7 = new Image(
		multiJulia5, 100,
		defaultView,
		WIDTH, HEIGHT
	);
	// Multi-Burning Ship
	var img8 = new Image(
		multiShip, 100,
		defaultView,
		WIDTH, HEIGHT
	);
	//Burning Ship Armada
	var img9 = new Image(
		ship, 200,
		new Frame(
			new Complex(-1.757413194, -0.00657118056),
			0.3,
			0.3
		),
		WIDTH, HEIGHT
	);
	// Burning Ship Julia Set
	var img10 = new Image(
		BSjulia, 100,
		defaultView,
		WIDTH, HEIGHT
	);
	// Burning Ship
	var img11 = new Image(
		ship, 300,
		defaultView,
		WIDTH, HEIGHT
	);
	// MultiShip 4
	var img12 = new Image(
		multiShip2, 100,
		defaultView,
		WIDTH, HEIGHT
	);
	var img13 = new Image(
		ship, 1000,
		new Frame(
			new Complex(-1.770848103815, -0.02849221687),
			1/42836028053,
			1/42836028053,
		),
		WIDTH, HEIGHT
	);
}

// Initial image settings:

// Try different samples with different image numbers imgX(X)
var currImg = img1;
var imgs = [];
var mouseX = null;
var mouseY = null;
var startDragX = null;
var startDragY = null;
var mouseDown = false;


// Draw loop
var draw = function() {
	if(currImg.drawing) {
		currImg.drawLayer();
	};
	setTimeout(draw, 0);
};

// Set an image to draw and start drawing it
var startImage = function(img) {
	currImg = img;
	currImg.reset();
	displayIterations();
	displayZoom();
};



// Toolbar functions
var displayIterations = function() {
	document.getElementById("iterations").innerHTML = "Iterations: " + currImg.iterations.toString();
};

var displayZoom = function() {
	document.getElementById("zoom").innerHTML = "Zoom: " + Number.parseFloat(1 / currImg.frame.reWidth).toExponential(10).toString();
};

var increaseIters = function() {
	currImg.iterations += Number(document.getElementById("iteration-increment").value);
	currImg.reset();
	displayIterations();
	startImage(currImg);
};

var decreaseIters = function() {
	currImg.iterations -= Number(document.getElementById("iteration-increment").value);
	currImg.reset();
	displayIterations();
	startImage(currImg);
};


// Mouse Events

var mousePressed = function() {
	if(!mouseDown) {
		startDragX = mouseX;
		startDragY = mouseY;
	}
	mouseDown = true;
};

// Based on mouse coordinates, calculate the frame for the new image and start it
var mouseReleased = function() {
	mouseDown = false;
	currImg.reset();
	imgs.push(currImg);
	let topCornerX = null;
	let topCornerY = null;
	let bottomCornerX = null;
	let bottomCornerY = null;
	let sameX = false;
	let sameY = false;
	if(startDragX < mouseX) {
		topCornerX = startDragX;
		bottomCornerX = mouseX;
	}
	else if(mouseX < startDragX) {
		topCornerX = mouseX;
		bottomCornerX = startDragX;
	}
	else {
		sameX = true;
	}
	if(startDragY < mouseY) {
		topCornerY = startDragY;
		bottomCornerY = mouseY;
	}
	else if(mouseY < startDragY) {
		topCornerY = mouseY;
		bottomCornerY = startDragY;
	}
	else {
		sameY = true;
	}
	let imgToSet = {};
	if(sameX && sameY) {
		let center = new Complex(
			currImg.frame.reMin + (mouseX * currImg.reIter),
			currImg.frame.imMin + (mouseY * currImg.imIter)
		);
		let zoomFactor = Number(document.getElementById("click-zoom-factor").value);
		imgToSet = new Image(
			currImg.fractal,
			currImg.iterations,
			new Frame(center, currImg.frame.reWidth / zoomFactor, currImg.frame.imHeight / zoomFactor),
			WIDTH, HEIGHT
		);
	}
	else {
		let windowWidth = bottomCornerX - topCornerX;
		let windowHeight = bottomCornerY - topCornerY;
		let centerX = (topCornerX + bottomCornerX) / 2;
		let centerY = (topCornerY + bottomCornerY) / 2;
		let center = new Complex(
			currImg.frame.reMin + (centerX * currImg.reIter),
			currImg.frame.imMin + (centerY * currImg.imIter)
		);
		let newReWidth = windowWidth * currImg.reIter;
		let newImHeight = windowHeight * currImg.imIter;
		if(windowWidth > windowHeight) {
			imgToSet = new Image(
				currImg.fractal,
				currImg.iterations,
				new Frame(center, newReWidth, newReWidth),
				WIDTH, HEIGHT
			);
		}
		else {
			imgToSet = new Image(
				currImg.fractal,
				currImg.iterations,
				new Frame(center, newImHeight, newImHeight),
				WIDTH, HEIGHT
			);
		}
	}
	startImage(imgToSet);

	startDragX = null;
	startDragY = null;
};

var mouseMoved = function() {
	mouseX = event.offsetX;
	mouseY = event.offsetY;
};


// Initialize events (canvas library function)
addEvent("mousedown", mousePressed);
addEvent("mouseup", mouseReleased);
addEvent("mousemove", mouseMoved);


// Run:
startImage(currImg);
draw();