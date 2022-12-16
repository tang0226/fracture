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
    
    this.getFractalType = function() {
        return this.fractal.constructor.name;
    };

    this.setFrame = function(frame) {
        this.frame = frame;
        this.reIter = frame.reWidth / _width;
        this.imIter = frame.imHeight / _height;
    };

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

    this.copy = function() {
        return new Image(this.fractal, this.iterations, this.frame);
    };
};
