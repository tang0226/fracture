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