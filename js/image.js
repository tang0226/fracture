/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, FRAME, AND CANVAS SIZE
******************************/

var Image = function(fractal, iterations, srcFrame) {
    this.fractal = fractal;
    this.iterations = iterations;

    this.srcFrame = srcFrame;
    this.frame = srcFrame.fitToCanvas();
    
    // Distance between pixels on the complex plane
    this.complexIter = 
        _width > _height ?
        this.frame.reWidth / _width :
        this.frame.imHeight / _height;
    
    this.currY = 0;
    this.currIm = this.frame.imMin;
    this.drawing = true;
    this.startTime = null;
    this.renderTime = null;
};


// Return the fractal type as a string
Image.prototype.getFractalType = function() {
    return this.fractal.constructor.name;
};


// Fit drawing frame to canvas and
// update dependent parameters
Image.prototype.fitToCanvas = function() {
    this.frame = this.srcFrame.fitToCanvas();
    this.complexIter = 
        _width > _height ?
        this.frame.reWidth / _width :
        this.frame.imHeight / _height;
};


// Set the source frame
Image.prototype.setFrame = function(srcFrame) {
    this.srcFrame = srcFrame;
};


// Draw one layer, moving down
Image.prototype.drawLayer = function() {
    let currRe = this.frame.reMin;
    for(let currX = 0; currX < _width; currX++) {

        let val = this.fractal.iterate(Complex(currRe, this.currIm), this.iterations);
        
        if(val == this.iterations) {
            // Part of set, color black
            canvas.fillStyle = hsl(0, 0, 0);
        }
        else {
            // Color scale: HSL (0-360, 100, 0-100)
            canvas.fillStyle = hsl(
                scale(val, 0, this.iterations, 0, 360),
                100,
                scale(val, 0, this.iterations, 0, 100)
            );
        }
        
        canvas.fillRect(currX, this.currY, 1, 1);
        
        currRe += this.complexIter;
    };
    
    this.currY += 1;
    this.currIm += this.complexIter;
    
    // Stop if at the bottom of the canvas
    if(this.currY > _height) {
        this.drawing = false;
    }

    // Update render time
    this.renderTime = new Date(new Date() - this.startTime);
    toolbar.displayRenderTime(this.renderTime);
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
    return new Image(this.fractal, this.iterations, this.srcFrame);
};
