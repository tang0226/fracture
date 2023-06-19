/******************************
IMAGE CLASS: RENDERING OF A FRACTAL WITH ITERATIONS, FRAME, AND CANVAS SIZE
******************************/

class Image {
    constructor(data) {
        this.fractal = data.fractal;

        this.iterations = data.iterations;
        this.escapeRadius = data.escapeRadius;
        this.smoothColoring = data.smoothColoring;

        this.srcFrame = data.srcFrame;
        this.frame = data.srcFrame.fitToCanvas(data.width, data.height);

        this.gradient = data.gradient;
        this.itersPerCycle = data.itersPerCycle;

        this.width = data.width;
        this.height = data.height;
        
        // Distance between / width of pixels on the complex plane
        this.complexIter = 
            this.width > this.height ?
            this.frame.reWidth / this.width :
            this.frame.imHeight / this.height;
    }

    // Fit drawing frame to canvas and
    // update dependent parameters
    fitToCanvas(width, height) {
        this.width = width;
        this.height = height;
        this.frame = this.srcFrame.fitToCanvas(width, height);
        this.complexIter = 
            width > height ?
            this.frame.reWidth / width :
            this.frame.imHeight / height;
    }

    // Set the source frame
    setFrame(srcFrame) {
        this.srcFrame = srcFrame;
    }

    // Return a deep copy of self: critical for fractal picking
    copy() {
        return new Image({
            fractal: this.fractal,
            iterations: this.iterations,
            escapeRadius: this.escapeRadius,
            smoothColoring: this.smoothColoring,
            srcFrame: this.srcFrame,
            gradient: this.gradient,
            itersPerCycle: this.itersPerCycle,
            width: this.width,
            height: this.height,
        });
    }
}
