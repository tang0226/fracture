/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, FRAME, AND CANVAS SIZE
******************************/

var Image = function(fractal, iterations, escapeRadius, srcFrame, width, height, canvasCtx) {
    this.fractal = fractal;
    this.iterations = iterations;
    this.escapeRadius = escapeRadius;

    this.srcFrame = srcFrame;
    this.frame = srcFrame.fitToCanvas(width, height);

    this.width = width;
    this.height = height;

    this.canvasCtx = canvasCtx;
    
    // Distance between pixels on the complex plane
    this.complexIter = 
        this.width > this.height ?
        this.frame.reWidth / this.width :
        this.frame.imHeight / this.height;
    
    this.currY = 0;
    this.currIm = this.frame.imMin;
    this.drawing = true;
    this.startTime = null;
    this.renderTime = null;
};


// Fit drawing frame to canvas and
// update dependent parameters
Image.prototype.fitToCanvas = function(width, height) {
    this.width = width;
    this.height = height;
    this.frame = this.srcFrame.fitToCanvas(width, height);
    this.complexIter = 
        width > height ?
        this.frame.reWidth / width :
        this.frame.imHeight / height;
};


// Set the source frame
Image.prototype.setFrame = function(srcFrame) {
    this.srcFrame = srcFrame;
};


// Draw one layer, moving down
Image.prototype.drawLayer = function() {
    let currRe = this.frame.reMin;
    for(let currX = 0; currX < this.width; currX++) {

        let val = Iterate[this.fractal.type](
            this.fractal.params,
            Complex(currRe, this.currIm),
            this.iterations,
            this.escapeRadius
        );
        
        if(val == this.iterations) {
            // Part of set, color black
            this.canvasCtx.fillStyle = hsl(0, 0, 0);
        }
        else {
            // Color scale: HSL (0-360, 100, 0-100)
            this.canvasCtx.fillStyle = hsl(
                scale(val, 0, this.iterations, 0, 360),
                100,
                scale(val, 0, this.iterations, 0, 100)
            );
        }
        
        this.canvasCtx.fillRect(currX, this.currY, 1, 1);
        
        currRe += this.complexIter;
    };
    
    this.currY += 1;
    this.currIm += this.complexIter;
    
    // Stop if at the bottom of the canvas
    if(this.currY > this.height) {
        this.drawing = false;
    }

    // Update render time
    this.renderTime = new Date() - this.startTime;
};


// Restart the render process
Image.prototype.reset = function() {
    this.currY = 0;
    this.currIm = this.frame.imMin;
    this.drawing = true;
    this.startTime = new Date();
};


// Return a deep copy of self: critical for fractal picking
Image.prototype.copy = function() {
    return new Image(
        this.fractal,
        this.iterations, this.escapeRadius,
        this.srcFrame,
        this.width, this.height,
        this.canvasCtx
    );
};
