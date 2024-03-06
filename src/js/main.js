const canvas = new Canvas({
  id: "main-canvas",
});
const controlCanvas = new Canvas({
  id: "control-canvas",
  interactive: true,
  eventCallbacks: {
    mouseMove: function(e) {
      // console.log(this.mouseDown)
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = this.state.mouseDown ? "green" : "red";
      this.ctx.fillRect(this.state.mouseX, this.state.mouseY, 20, 20);
    },
    mouseDown: function(e) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(this.state.mouseX, this.state.mouseY, 20, 20);
    },
    mouseUp: function(e) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(this.state.mouseX, this.state.mouseY, 20, 20);
    }
  }
});

function setCanvasDim(w, h) {
  canvas.setDim(w, h);
  controlCanvas.setDim(w, h);
}

setCanvasDim(window.innerWidth, window.innerHeight);

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


// Define elements first, before links
const ui = {
  fractalType: new Dropdown({
    id: "fractal-type",
    dispStyle: "inline",
    containerId: "fractal-select-container",
    value: "Mandelbrot",
    eventCallbacks: {
      change() {
        this.update();
        let newFractal = fractals[this.value.toLowerCase()];
        this.state.fractal = newFractal.copy(); // check this
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
          this.state.isQueen = false;
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
    value: 1000,
    eventCallbacks: {
      change() {
        if (isNaN(Number(this.element.value)) || Number(this.element.value) < 1) {
          this.linked.alert.show();
          this.state.isClean = false;
        }
        else {
          this.update();
          this.linked.alert.hide();
          this.state.isClean = true;
        }
      },
    },
  }),
  iterationsAlert: new TextElement({
    id: "iterations-alert",
    innerText: "Iterations must be a positive integer",
    hide: true,
  }),
};

// Define links here
ui.fractalType.addLinkedObject("juliaConstant", ui.juliaConstant);
ui.fractalType.addLinkedObject("juliaConstantAlert", ui.juliaConstantAlert);
ui.fractalType.addLinkedObject("exponent", ui.exponent);
ui.fractalType.addLinkedObject("exponentAlert", ui.exponentAlert);
ui.juliaConstant.addLinkedObject("alert", ui.juliaConstantAlert);
ui.exponent.addLinkedObject("alert", ui.exponentAlert);
ui.iterations.addLinkedObject("alert", ui.iterationsAlert);



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
