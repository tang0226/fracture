/******************************
RENDER SETTINGS CLASS: RENDERING OF A FRACTAL WITH ITERATIONS, FRAME, AND CANVAS SIZE
******************************/

/**
    fractal (incl. type and constants)
    fractalSettings
        iterations
        escape radius
    region in comp. plane (aka frame, possible rename)
    gradient
    gradientSettings
        IPC
    colorSettings
        smooth coloring
**/

class RenderSettings {
    constructor(params) {
        // Never called, only a placeholder for 
        // reconstruction and deep copying
        this.params = params;

        this.fractal = params.fractal.copy();

        this.fractalSettings = {
            iters: params.fractalSettings.iters,
            escapeRadius: params.fractalSettings.escapeRadius,
        };

        this.srcFrame = params.srcFrame.copy();
        this.frame = this.srcFrame.fitToCanvas(width, height);

        this.gradient = params.gradient.copy();
        this.gradientSettings = {
            itersPerCycle: params.gradientSettings.itersPerCycle,
        };

        this.colorSettings = {
            smoothColoring: params.smoothColoring,
        };

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
        return new RenderSettings(this.params);
    }
}

RenderSettings.reconstruct = function(renderSettings) {
    return new RenderSettings(renderSettings.params);
};
