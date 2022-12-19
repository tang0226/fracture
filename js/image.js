/******************************
IMAGE PROTOTYPE: RENDERING OF A FRACTAL WITH ITERATIONS, REGION, AND CANVAS SIZE
******************************/

var Image = function(fractal, iterations, frame) {
    this.fractal = fractal;
    this.iterations = iterations;

    this.frame = frame;
    
    // Variables for rendering
    this.reIter = frame.reWidth / _width;
    this.imIter = frame.imHeight / _height;
    this.currY = 0;
    this.currIm = frame.imMin;
    this.drawing = true;
    this.startTime = null;
    this.renderTime = null;
};


// Return the fractal type as a string
Image.prototype.getFractalType = function() {
    return this.fractal.constructor.name;
};


// Set the frame and dependent parameters
Image.prototype.setFrame = function(frame) {
    this.frame = frame;
    this.reIter = frame.reWidth / _width;
    this.imIter = frame.imHeight / _height;
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
            canvas.fillStyle = hsl(scale(val, 0, this.iterations, 0, 360), 100, scale(val, 0, this.iterations, 0, 100));
        }
        
        canvas.fillRect(currX, this.currY, 1, 1);
        
        currRe += this.reIter;
    };
    
    this.currY += 1;
    this.currIm += this.imIter;
    
    // Stop if at the bottom of the canvas
    if(this.currY > _width) {
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
    return new Image(this.fractal, this.iterations, this.frame);
};