// Custom modules/libraries used here (canvas and Math)
// are imported from the HTML document, main.html.
// Core files (image, frame, etc.) have been imported as well

setCanvasDim(600, 600);
noStroke();

colorMode("HSL");


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
	);
	// Minibrot, deep zoom into Mandelbrot
	var img2 = new Image(
		mandel, 1000,
		new Frame(
			new Complex(0.4422127499646909, 0.23935098947264477),
				0.00000001,
				0.00000001
		),
	);
	// Deep zoom into Burning Ship
	var img3 = new Image(
		ship, 6000,
		new Frame(
			new Complex(1.144563047301867, -1.2797276570058733),
				0.000000000001,
				0.000000000001
		),
	);
	// Sample Julia set
	var img4 = new Image(
		julia1, 100,
		defaultView,
	);
	// Deep zoom into Mandelbrot
	var img5 = new Image(
		mandel, 2500,
		new Frame(
			new Complex(-1.4746396689670118, -0.0000000065964943055555555),
			0.00000000001,
			0.00000000001
		),
	);
	// Multibrot set
	var img6 = new Image(
		multi3, 100,
		defaultView,
	);
	// MultiJulia set
	var img7 = new Image(
		multiJulia5, 100,
		defaultView,
	);
	// Multi-Burning Ship
	var img8 = new Image(
		multiShip, 100,
		defaultView,
	);
	//Burning Ship Armada
	var img9 = new Image(
		ship, 200,
		new Frame(
			new Complex(-1.757413194, -0.00657118056),
			0.3,
			0.3
		),
	);
	// Burning Ship Julia Set
	var img10 = new Image(
		BSjulia, 100,
		defaultView,
	);
	// Burning Ship
	var img11 = new Image(
		ship, 300,
		defaultView,
	);
	// MultiShip 4
	var img12 = new Image(
		multiShip2, 100,
		defaultView,
	);
	var img13 = new Image(
		ship, 1000,
		new Frame(
			new Complex(-1.770848103815, -0.02849221687),
			1/42836028053,
			1/42836028053,
		),
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
	let complexCoords = currImg.frame.toComplexCoords(mouseX, mouseY);
	let complexRe = complexCoords.re.toString();
	let complexIm = complexCoords.im.toString();
	if(Number(complexIm) >= 0) {
		complexIm = "+" + complexIm;
	}
	document.getElementById("mouse-complex-coords").innerHTML = "Mouse coordinates: " + complexRe + complexIm + "i";
};

var mouseOut = function() {
	document.getElementById("mouse-complex-coords").innerHTML = "Mouse coordinates: N/A";
};

// Initialize events (canvas library function)
addEvent("mousedown", mousePressed);
addEvent("mouseup", mouseReleased);
addEvent("mousemove", mouseMoved);
addEvent("mouseout", mouseOut);


// Run:
startImage(currImg);
draw();