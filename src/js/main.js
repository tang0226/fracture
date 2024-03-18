const canvas = new Canvas({
  id: "main-canvas",
});
const controlCanvas = new Canvas({
  id: "control-canvas",
  interactive: true,
  eventCallbacks: {

  }
});

function setCanvasDim(w, h) {
  canvas.setDim(w, h);
  controlCanvas.setDim(w, h);
}

setCanvasDim(window.innerWidth - 500, window.innerHeight);

// Fractals
const fractals = {
  mandelbrot: new Fractal("Mandelbrot"),
  julia: new Fractal("Julia", {
    c: Complex(0, 1),
  }),
  multibrot: new Fractal("Multibrot", {
    e: 3,
  }),
};

// Frames
const defaultView = new Frame(Complex(0, 0), 4, 4);


// Gradent

const defaultGradient = new Gradient(
  "2;\n0, 0 0 0;\n1, 255 255 255;"
);

var image = new ImageSettings({
  width: canvas.width,
  height: canvas.height,
  fractal: fractals.mandelbrot.copy(),
  fractalSettings: {
    iters: 1000,
    escapeRadius: 256,
  },
  srcFrame: new Frame([-0.5, 0], 4, 4),
  gradient: defaultGradient,
  gradientSettings: { itersPerCycle: null},
  colorSettings: { smoothColoring: true},
});


// Define elements first, before links
const ui = {
  mainCanvas: new Canvas({
    id: "main-canvas",
    utils: {
      render: function(imageSettings, renderSettings) {
        let renderWorker = new Worker("./js/render-worker.js");

        renderWorker.onmessage = function(event) {
          let data = event.data;
          switch (data.type) {
            case "update":
              this.ctx.putImageData(data.imgData, data.x, data.y);
              break;
            case "progress":
              let percent = Math.floor(data.y / data.h * 100);
              this.linked.progress.set(percent + "%");
              this.linked.progressBar.set(percent);
          }
        }.bind(this);
        
        renderWorker.postMessage({
          msg: "draw",
          settings: JSON.parse(JSON.stringify(imageSettings)),
        });
      },
    },
  }),

  progress: new TextElement({
    id: "progress",
    dispStyle: "inline",
    innerText: "0%",
  }),

  progressBar: new ProgressBar({
    id: "progress-bar",
  }),
  
  fractalType: new Dropdown({
    id: "fractal-type",
    dispStyle: "inline",
    containerId: "fractal-select-container",
    value: "Mandelbrot",
    state: {
      fractalType: "Mandelbrot",
    },
    eventCallbacks: {
      change() {
        this.update();
        let newFractal = fractals[this.value.toLowerCase()];
        this.state.fractalType = newFractal.name; // check this
        if (newFractal.meta.reqJuliaConst) {
          this.linked.juliaConstant.showContainer();
        }
        else {
          this.linked.juliaConstant.hideContainer();
          this.linked.juliaConstant.set("");
          this.linked.juliaConstant.jc = null;
          this.linked.juliaConstantAlert.hide();
          this.linked.juliaConstant.state.isClean = true;
        }
        if (newFractal.meta.reqExponent) {
          this.linked.exponent.showContainer();
        }
        else {
          this.linked.exponent.hideContainer();
          this.linked.exponent.set("");
          this.linked.exponent.e = null;
          this.linked.exponentAlert.hide();
          this.linked.exponent.state.isClean = true;
        }
      },
    },
  }),

  juliaConstant: new TextInput({
    id: "julia-constant",
    dispStyle: "inline",
    containerId: "julia-constant-container",
    eventCallbacks: {
      change() {
        let newJc = Complex.parseString(this.element.value);
        if (newJc) {
          this.update();
          this.state.c = newJc;
          this.linked.alert.hide();
          this.state.isClean = true;
        }
        else {
          this.linked.alert.show();
          this.state.isClean = false;
        }
      },
    },
  }),

  juliaConstantAlert: new TextElement({
    id: "julia-constant-alert",
    innerText: "Julia constant must be of the form a+bi",
    hide: true,
  }),

  exponent: new TextInput({
    id: "exponent",
    dispStyle: "inline",
    containerId: "exponent-container",
    eventCallbacks: {
      change() {
        let newExp = Number(this.element.value);
        if (isNaN(newExp) || newExp < 2) {
          this.linked.alert.show();
          this.state.isClean = false;
        }
        else {
          this.update();
          this.linked.alert.hide();
          this.state.e = newExp;
          this.state.isClean = true;
        }
      },
    },
  }),

  exponentAlert: new TextElement({
    id: "exponent-alert",
    innerText: "Exponent must be an integer greater than 1",
    hide: true,
  }),

  iterations: new TextInput({
    id: "iterations",
    dispStyle: "inline",
    containerId: "iterations-container",
    value: "100",
    state: {
      iters: 100,
      isClean: true,
    },
    eventCallbacks: {
      change() {
        if (isNaN(Number(this.element.value)) || Number(this.element.value) < 1) {
          this.linked.alert.show();
          this.state.isClean = false;
        }
        else {
          this.update();
          this.state.iters = Number(this.element.value);
          this.utils.clean();
        }
      },
    },
    utils: {
      clean() {
        this.linked.alert.hide();
        this.state.isClean = true;
      },
    },
  }),

  iterationsAlert: new TextElement({
    id: "iterations-alert",
    innerText: "Iterations must be a positive integer",
    hide: true,
  }),

  iterationIncrement: new TextInput({
    id: "iteration-increment",
    dispStyle: "inline",
    value: "100",
    state: {
      iterIncr: 100,
      isClean: true,
    },
    eventCallbacks: {
      change() {
        if (isNaN(Number(this.element.value)) || Number(this.element.value) < 1) {
          this.linked.alert.show();
          this.state.isClean = false;
        }
        else {
          this.update();
          this.state.iterIncr = Number(this.element.value);
          this.linked.alert.hide();
          this.state.isClean = true;
        }
      },
    },
  }),

  iterationIncrementAlert: new TextElement({
    id: "iteration-increment-alert",
    innerText: "Iteration increment must be a positive integer",
    hide: true,
  }),

  increaseIterations: new Button({
    id: "increase-iterations",
    eventCallbacks: {
      click() {
        if (this.linked.iterIncr.state.isClean) {
          let newIters = this.linked.iters.state.iters +
            this.linked.iterIncr.state.iterIncr;
          
          this.linked.iters.set(newIters);
          this.linked.iters.state.iters = newIters;
          this.linked.iters.utils.clean();
        }
      },
    },
  }),
  
  decreaseIterations: new Button({
    id: "decrease-iterations",
    eventCallbacks: {
      click() {
        if (this.linked.iterIncr.state.isClean) {
          let newIters = this.linked.iters.state.iters -
            this.linked.iterIncr.state.iterIncr;
          
          if (newIters > 0) {
            this.linked.iters.set(newIters);
            this.linked.iters.state.iters = newIters;
            this.linked.iters.utils.clean();
          }
        }
      },
    },
  }),

  escapeRadius: new TextInput({
    id: "escape-radius",
    containerId: "escape-radius-container",
    dispStyle: "inline",
    value: "256",
    state: {
      er: 256,
      isClean: true,
    },
    eventCallbacks: {
      change() {
        if (isNaN(Number(this.element.value)) || Number(this.element.value) < 2) {
          this.linked.alert.show();
          this.state.isClean = false;
        }
        else {
          this.update();
          this.state.er = Number(this.element.value);
          this.linked.alert.hide();
          this.state.isClean = true;
        }
      },
    },    
  }),

  escapeRadiusAlert: new TextElement({
    id: "escape-radius-alert",
    innerText: "Escape radius must be a number at least 2",
    hide: true,
  }),

  redraw: new Button({
    id: "redraw",
    dispStyle: "inline",
    eventCallbacks: {
      click() {
        this.utils.render();
      },
    },
    utils: {
      render() {
        this.linked.canvas.utils.render({
            width: this.linked.canvas.width,
            height: this.linked.canvas.height,
            fractal: new Fractal(
              this.linked.fractalType.state.fractalType,
              {
                c: this.linked.juliaConstant.state.c || undefined,
                e: this.linked.exponent.state.e || undefined,
              },
            ),
            fractalSettings: {
              iters: this.linked.iterations.state.iters,
              escapeRadius: this.linked.escapeRadius.state.er,
            },
            srcFrame: new Frame([-0.5, 0], 4, 4),
            gradient: defaultGradient,
            gradientSettings: { itersPerCycle: null},
            colorSettings: { smoothColoring: true},
        });
      },
    },
  }),
};

// Define links here
ui.redraw.addLinkedObject("canvas", ui.mainCanvas);
ui.redraw.addLinkedObject("fractalType", ui.fractalType);
ui.redraw.addLinkedObject("juliaConstant", ui.juliaConstant);
ui.redraw.addLinkedObject("exponent", ui.exponent);
ui.redraw.addLinkedObject("iterations", ui.iterations);
ui.redraw.addLinkedObject("escapeRadius", ui.escapeRadius);

ui.mainCanvas.addLinkedObject("progress", ui.progress);
ui.mainCanvas.addLinkedObject("progressBar", ui.progressBar);

ui.fractalType.addLinkedObject("juliaConstant", ui.juliaConstant);
ui.fractalType.addLinkedObject("juliaConstantAlert", ui.juliaConstantAlert);
ui.fractalType.addLinkedObject("exponent", ui.exponent);
ui.fractalType.addLinkedObject("exponentAlert", ui.exponentAlert);

ui.juliaConstant.addLinkedObject("alert", ui.juliaConstantAlert);

ui.exponent.addLinkedObject("alert", ui.exponentAlert);

ui.iterations.addLinkedObject("alert", ui.iterationsAlert);

ui.iterationIncrement.addLinkedObject("alert", ui.iterationIncrementAlert);

ui.increaseIterations.addLinkedObject("iters", ui.iterations);
ui.increaseIterations.addLinkedObject("iterIncr", ui.iterationIncrement);

ui.decreaseIterations.addLinkedObject("iters", ui.iterations);
ui.decreaseIterations.addLinkedObject("iterIncr", ui.iterationIncrement);

ui.escapeRadius.addLinkedObject("alert", ui.escapeRadiusAlert);


// Initial render
ui.redraw.utils.render();

/**
// Images
const defaultImages = {
  Mandelbrot: new Image(
    new Fractal("Mandelbrot"),
    1000, 256, true,
    new Frame(Complex(-0.5, 0), 4, 4),
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  Julia: new Image(
    new Fractal("Julia", {c: Complex(0, 1)}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  Multibrot: new Image(
    new Fractal("Multibrot", {e: 3}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  Multijulia: new Image(
    new Fractal("Multijulia", {e: 3, c: Complex(-0.12, -0.8)}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  Tricorn: new Image(
    new Fractal("Tricorn"),
    1000, 256, true,
    new Frame(
      Complex(-0.25, 0),
      4, 4
    ),
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  TricornJulia: new Image(
    new Fractal("TricornJulia", {c: Complex(-1, 0)}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  Multicorn: new Image(
    new Fractal("Multicorn", {e: 3}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  MulticornJulia: new Image(
    new Fractal("MulticornJulia", {e: 3, c: Complex(-1, -1)}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  BurningShip: new Image(
    new Fractal("BurningShip"),
    1000, 256, true,
    new Frame(Complex(0, -0.5), 4, 4),
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  BurningShipJulia: new Image(
    new Fractal("BurningShipJulia", {c: Complex(-1.5, 0)}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  Multiship: new Image(
    new Fractal("Multiship", {e: 3}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  ),
  MultishipJulia: new Image(
    new Fractal("MultishipJulia", {e: 3, c: Complex(-1.326667, 0)}),
    1000, 256, true,
    defaultView,
    defaultGradient, 200,
    canvasWidth, canvasHeight
  )
};



// Initial image settings:
var currImg = defaultImages.Mandelbrot.copy();
var storedImg = null;
var currMode = "default";


var renderInProgress = true;

// Render worker
const renderWorker = new Worker("./js/render.js");

renderWorker.onmessage = function(event) {
  let data = event.data;
  if(data.type == "progress") {
    toolbar.displayRenderTime(data.renderTime);
    toolbar.displayProgress(data.progress);
  }
  if(data.type == "done") {
    canvasCtx.putImageData(data.imgData, 0, 0);
    toolbar.displayRenderTime(data.renderTime);
    renderInProgress = false;
  }
};

function draw() {
  document.getElementById("settings-json").value = JSON.stringify(currImg);
  renderWorker.postMessage({
    type: "draw",
    img: currImg
  });
  renderInProgress = true;
};



// Mouse variables
var mouseX = null;
var mouseY = null;
var startDragX = null;
var startDragY = null;
var mouseDown = false;


// Mouse functions
function resetDrag() {
  mouseDown = false;
  startDragX = null;
  startDragY = null;
  controlsCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
};


// Mouse Events

controlsCanvas.onmousedown = function(event) {
  if(renderInProgress) {
    return;
  }

  if(event.buttons == 1) {
    if(!mouseDown) {
      startDragX = mouseX;
      startDragY = mouseY;
    }
    mouseDown = true;
  }
};


// Based on mouse coordinates, click/drag,
// and keyboard events, draw the new image
controlsCanvas.onmouseup = function() {
  // Glitch-proofing
  if(!mouseDown) {
    return;
  }

  if(renderInProgress) {
    return;
  }

  let newFrame = false;

  // Click
  if(mouseX == startDragX && mouseY == startDragY) {
    // Julia mode toggling
    if(keys["Alt"]) {
      if(currMode == "default") {
        // Switch to Julia mode

        // Confirm that Julia mode is applicable
        if(!currImg.fractal.requiresJuliaConstant) {
          currMode = "julia";

          // Store current image for switching back
          storedImg = currImg.copy();

          // Initialize new image based on Julia
          // equivalent of previous fractal
          let newFractalType = currImg.fractal.juliaEquivalent;
          currImg = defaultImages[newFractalType].copy();

          // New fractal requires a julia constant,
          // but not necessarily an exponent
          currImg.fractal.params.c = storedImg.frame.toComplexCoords(
            mouseX, mouseY,
            canvasWidth, canvasHeight
          );
          if(Fractal.requiresExponent(newFractalType)) {
            currImg.fractal.params.e = storedImg.fractal.params.e;
          }
        }
      }

      
      else {
        // Return to default mode
        currMode = "default";
        currImg = storedImg.copy();
        storedImg = null;
      }
      toolbar.syncFractal();
      toolbar.syncImageParams();
      toolbar.setImgPalette();
    }

    // Center the frame
    else if(keys["Control"]) {
      let currFrame = currImg.frame;
      newFrame = new Frame(
        currFrame.toComplexCoords(mouseX, mouseY, canvasWidth, canvasHeight),
        currFrame.reWidth,
        currFrame.imHeight
      );
    }

    // Zoom
    else {
      let zoomFactor = toolbar.clickZoomFactor;

      // Calculations to keep clicked point
      // in the same position on canvas
      let xOffset = mouseX - (canvasWidth / 2);
      let yOffset = mouseY - (canvasHeight / 2);
      
      let newReWidth = currImg.frame.reWidth;
      let newImHeight = currImg.frame.imHeight;

      // Zoom out
      if(keys["Shift"]) {
        newReWidth *= zoomFactor;
        newImHeight *= zoomFactor;
      }

      // Zoom in
      else {
        newReWidth /= zoomFactor;
        newImHeight /= zoomFactor;
      }

      // Update frame
      let focus = currImg.frame.toComplexCoords(
        mouseX, mouseY,
        canvasWidth, canvasHeight
      );
      newFrame = new Frame(
        Complex(
          focus.re - (xOffset * newReWidth / canvasWidth),
          focus.im - (yOffset * newImHeight / canvasHeight)
        ),
        newReWidth, newImHeight
      );
    }
  }

  // Drag
  else if(mouseX != startDragX && mouseY != startDragY) {
    newFrame = new Frame(
      Complex(
        currImg.frame.reMin + ((mouseX + startDragX) / 2 * currImg.complexIter),
        currImg.frame.imMin + ((mouseY + startDragY) / 2 * currImg.complexIter)
      ),
      Math.abs(mouseX - startDragX) * currImg.complexIter,
      Math.abs(mouseY - startDragY) * currImg.complexIter
    );
  }

  // Update frame
  if(newFrame) {
    currImg.setFrame(newFrame);
  }
  
  currImg.fitToCanvas(canvasWidth, canvasHeight);
  toolbar.updateZoom();
  toolbar.redraw();

  // Reset drag
  resetDrag();
};


controlsCanvas.onmousemove = function(event) {
  mouseX = event.offsetX;
  mouseY = event.offsetY;
  toolbar.displayMouseComplexCoords();
  if(mouseDown) {
    controlsCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    controlsCanvasCtx.strokeStyle = "#FF0000";
    controlsCanvasCtx.strokeRect(
      Math.min(startDragX, mouseX),
      Math.min(startDragY, mouseY),
      Math.abs(mouseX - startDragX),
      Math.abs(mouseY - startDragY)
    );
  }
};


controlsCanvas.onmouseout = function() {
  resetDrag();

  // Display N/A for mouse coordinates
  toolbar.resetMouseComplexCoords();
};



// Keys variables
const keys = {};

// Keys functions
function resetKeys() {
  for(let key in keys) {
    keys[key] = false;
  }
};

window.onkeydown = function(event) {
  keys[event.key] = true;
  if(event.key == "Escape") {
    resetDrag();
  }
  if(event.key == "Enter" && document.activeElement.nodeName != "TEXTAREA") {
    document.activeElement.blur();
    toolbar.redraw();
  }
};

window.onkeyup = function(event) {
  keys[event.key] = false;
};

window.onblur = function() {
  resetKeys();
}



// Run:
toolbar.init();
draw();
**/
