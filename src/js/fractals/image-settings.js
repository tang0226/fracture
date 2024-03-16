/******************************
IMAGE SETTINGS CLASS: ALL PARAMETERS FOR AN IMAGE OF A FRACTAL
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

class ImageSettings {
  constructor(params, reconstruct = false) {
    // Never called, only a placeholder for 
    // reconstruction and deep copying
    this.params = params;

    this.width = params.width;
    this.height = params.height;

    if (reconstruct) {
      this.fractal = Fractal.reconstruct(params.fractal);
      this.srcFrame = Frame.reconstruct(params.srcFrame);
      this.gradient = Gradient.reconstruct(params.gradient);
    }
    else {
      this.fractal = params.fractal.copy();
      this.srcFrame = params.srcFrame.copy();
      this.gradient = params.gradient.copy();
    }

    this.fractalSettings = {...params.fractalSettings};

    this.frame = this.srcFrame.fitToCanvas(params.width, params.height);

    this.gradientSettings = {
      itersPerCycle: params.gradientSettings.itersPerCycle,
    };

    this.colorSettings = {...params.colorSettings};

    
    // Distance between / width of pixels on the complex plane
    this.complexIter = 
      this.width > this.height ?
      this.frame.reWidth / this.width :
      this.frame.imHeight / this.height;
  }

  // Fit drawing frame to canvas and
  // update dependent parameters
  fitToCanvas(w, h) {
    this.width = w;
    this.height = h;
    this.frame = this.srcFrame.fitToCanvas(w, h);
    this.complexIter = 
      w > h ?
      this.frame.reWidth / w :
      this.frame.imHeight / h;
  }

  // Set the source frame
  setFrame(srcFrame) {
    this.srcFrame = srcFrame;
  }

  // Return a deep copy of self: critical for fractal picking
  copy() {
    return new ImageSettings(this.params);
  }

  // Reconstruct serialized object to restore class methods
  static reconstruct(imageSettings) {
    return new ImageSettings(imageSettings, true);
  };
}
