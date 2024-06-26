/******************************
IMAGE CLASS: RENDERING OF A FRACTAL WITH ITERATIONS, FRAME, AND CANVAS SIZE
******************************/

class Image {
    constructor(
        fractal,
        iterations, escapeRadius, smoothColoring,
        srcFrame,
        palette, itersPerCycle,
        width, height
    ) {
        
        this.fractal = fractal;

        this.iterations = iterations;
        this.escapeRadius = escapeRadius;
        this.smoothColoring = smoothColoring;

        this.srcFrame = srcFrame;
        this.frame = srcFrame.fitToCanvas(width, height);

        this.palette = palette;
        this.itersPerCycle = itersPerCycle;

        this.width = width;
        this.height = height;
        
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
        return new Image(
            this.fractal,
            this.iterations, this.escapeRadius, this.smoothColoring,
            this.srcFrame,
            this.palette, this.itersPerCycle,
            this.width, this.height,
        );
    }
}
