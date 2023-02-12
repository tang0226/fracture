/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, FRAME, AND CANVAS SIZE
******************************/

var Image = function(fractal, iterations, escapeRadius, srcFrame, palette, width, height) {
    this.fractal = fractal;
    this.iterations = iterations;
    this.escapeRadius = escapeRadius;

    this.srcFrame = srcFrame;
    this.frame = srcFrame.fitToCanvas(width, height);

    this.palette = palette;

    this.width = width;
    this.height = height;
    
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
        this.palette,
        this.width, this.height,
    );
};
