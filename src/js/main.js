const SETTINGS = {
  toolbarWidth: 450,
  gradientBarHeight: 15,
};

const DEFAULTS = {
  iters: 100,
  escapeRadius: 256,
  smoothColoring: true,

  srcFrame: new Frame(Complex(0, 0), 4, 4),
  specialSrcFrame: {
    mandelbrot: new Frame(Complex(-0.5, 0), 4, 4),
    burningShip: new Frame(Complex(-0.5, -0.25), 4, 4),
    tricorn: new Frame(Complex(-0.25, 0), 4, 4)
  },
  gradient: new Gradient(
    `12;0, 0 0 0;1, 150 0 0;2, 0 0 0;3, 200 200 0;4, 0 0 0;5, 50 100 50;
     6, 0 0 0;7, 0 175 175;8, 0 0 0;9, 75 75 150;10, 0 0 0;11, 100 50 150;`
  ),
};

DEFAULTS.imageSettings = new ImageSettings({
  width: window.innerWidth - SETTINGS.toolbarWidth,
  height: window.innerHeight,
  fractal: new Fractal(FRACTAL_TYPES.mandelbrot),
  iterSettings: {
    iters: DEFAULTS.iters,
    escapeRadius: DEFAULTS.escapeRadius,
    smoothColoring: true,
  },
  srcFrame: DEFAULTS.specialSrcFrame.mandelbrot,
  gradient: DEFAULTS.gradient,
  gradientSettings: { itersPerCycle: null},
});



var currSettings = DEFAULTS.imageSettings.copy(),
  lastSettings, queuedFrame, renderInProgress, renderWorker, renderProgress, renderTime;


function pushSettings(newSettings) {
  lastSettings = ImageSettings.reconstruct(currSettings);
  currSettings = ImageSettings.reconstruct(newSettings);
}

function render(imageSettings, _pushSettings = true) {
  if (_pushSettings) {
    pushSettings(imageSettings);
  }
  renderInProgress = true;

  renderWorker = new Worker("./js/render-worker.js");

  renderWorker.onmessage = function(event) {
    let data = event.data;
    switch (data.type) {
      case "update":
        mainCanvas.ctx.putImageData(data.imgData, data.x, data.y);
        break;

      case "progress":
        let percent = Math.floor(data.y / data.h * 100);
        progressDisp.set(percent + "%");
        progressBar.set(percent);
        renderProgress = percent;

        renderTimeDisp.set(msToTime(data.renderTime));
        renderTime = data.renderTime;
        break;

      case "done":
        renderInProgress = false;
    }
  };

  renderWorker.postMessage({
    msg: "draw",
    settings: JSON.parse(JSON.stringify(imageSettings)),
  });
}

function cancelRender(skipMsg) {
  if (renderInProgress) {
    renderWorker.terminate();
    renderInProgress = false;
    if (!skipMsg) {
      progressDisp.set(renderProgress + "%" + " (cancelled)");
    }
  }
}

// Set frame for new redraw (when changing fractals)
function queueDefaultFrame() {
  queuedFrame =
    DEFAULTS.specialSrcFrame[fractalDropdown.element.value] || DEFAULTS.srcFrame;
}


const toolbar = new Element({
  id: "toolbar",
  init() {
    this.element.style.width = SETTINGS.toolbarWidth + "px";
  },
});

const mainCanvas = new Canvas({
  id: "main-canvas",
  state: {
    currSettings: ImageSettings.reconstruct(DEFAULTS.imageSettings),
  },
  init() {
    this.setDim(window.innerWidth - SETTINGS.toolbarWidth, window.innerHeight);
  },
});

const controlCanvas = new Canvas({
  id: "control-canvas",
  interactive: true,
  init() {
    this.setDim(window.innerWidth - SETTINGS.toolbarWidth, window.innerHeight);
  },
  eventCallbacks: {
    mouseMove() {
      if (this.state.mouseDown) {
        let params = [
          Math.min(this.state.startDragX, this.state.mouseX),
          Math.min(this.state.startDragY, this.state.mouseY),
          Math.abs(this.state.mouseX - this.state.startDragX),
          Math.abs(this.state.mouseY - this.state.startDragY),
        ];
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#FFFFFF44";
        this.ctx.fillRect(...params);
        this.ctx.strokeStyle = "#000000";
        this.ctx.strokeRect(...params);
      }
    },

    mouseUp() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      let frame = currSettings.frame;
      if (!(this.state.mouseX == this.state.startDragX &&
        this.state.mouseY == this.state.startDragY)) {

        let re = scale(
          Math.min(this.state.startDragX, this.state.mouseX),
          0, this.width, frame.reMin, frame.reMin + frame.reWidth
        );

        let im = scale(
          Math.min(this.state.startDragY, this.state.mouseY),
          0, this.height, frame.imMin, frame.imMin + frame.imHeight
        );

        let w = Math.abs(this.state.mouseX - this.state.startDragX) /
          this.width * frame.reWidth;
        let h = Math.abs(this.state.mouseY - this.state.startDragY) /
          this.height * frame.imHeight;

        let newSrcFrame = new Frame(
          [re + w / 2, im + h / 2],
          w, h
        );
        
        let img = currSettings.copy();
        img.setSrcFrame(newSrcFrame);

        cancelRender(true);
        render(img);
      }
    },
    mouseOut() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    },
  },
});

const progressDisp = new TextElement({
  id: "progress",
  dispStyle: "inline",
  innerText: "0%",
});

const progressBar = new ProgressBar({
  id: "progress-bar",
});

const renderTimeDisp = new TextElement({
  id: "render-time",
  dispStyle: "inline",
});

const renderButton = new Button({
  id: "render",
  dispStyle: "inline",
  eventCallbacks: {
    click() {
      this.utils.render();
    },
  },
  utils: {
    render() {
      if (renderInProgress) return;
      var canRender = true;

      // check conditional inputs
      if (juliaConstInput.state.isUsed && !juliaConstInput.state.isClean) {
        juliaConstAlert.show();
        canRender = false;
      }
      if (expInput.state.isUsed && !expInput.state.isClean) {
        expAlert.show();
        canRender = false;
      }

      // check other inputs
      if (!itersInput.state.isClean || !escapeRadiusInput.state.isClean || !gradientInput.state.isClean) {
        canRender = false;
      }

      if (canRender) {
        let frame;

        // If fractal changed and new frame is queued
        if (queuedFrame) {
          frame = queuedFrame;
          queuedFrame = null;
        }
        // Otherwise, stick to current frame
        else {
          frame = currSettings.srcFrame;
        }

        let fracParams = {};
        if (juliaConstInput.state.c) {
          fracParams.c = juliaConstInput.state.c
        }
        if (expInput.state.e) {
          fracParams.e = expInput.state.e;
        }

        let settings = {
          width: mainCanvas.width,
          height: mainCanvas.height,
          fractal: new Fractal(
            FRACTAL_TYPES[fractalDropdown.state.fractalType.id],
            fracParams,
          ),
          iterSettings: {
            iters: itersInput.state.iters,
            escapeRadius: escapeRadiusInput.state.er,
            smoothColoring: smoothColoringCheckbox.element.checked,
          },
          srcFrame: frame,
          gradient: gradientInput.state.gradient,
          gradientSettings: { itersPerCycle: null},
        };
        render(settings);
      }
    },
  },
});

const cancelButton = new Button({
  id: "cancel",
  dispStyle: "inline",
  eventCallbacks: {
    click() {
      cancelRender();
    },
  },
});

const fractalDropdown = new Dropdown({
  id: "fractal-type",
  dispStyle: "inline",
  containerId: "fractal-select-container",
  value: "mandelbrot",
  state: {
    fractalType: FRACTAL_TYPES.mandelbrot,
  },
  eventCallbacks: {
    change() {
      this.state.fractalType = FRACTAL_TYPES[this.element.value];
      queueDefaultFrame();
      this.utils.updateParameterDisplays();
      resetInputs();
    },
  },
  utils: {
    updateParameterDisplays() {
      if (this.state.fractalType.meta.reqJuliaConst) {
        juliaConstInput.showContainer();
        juliaConstInput.state.isUsed = true;
      }
      else {
        juliaConstInput.hideContainer();
        juliaConstInput.set("");
        juliaConstAlert.hide();

        juliaConstInput.state.jc = null;
        juliaConstInput.state.isClean = false;
        juliaConstInput.state.isUsed = false;
      }
      if (this.state.fractalType.meta.reqExponent) {
        expInput.showContainer();
        expInput.state.isUsed = true;
      }
      else {
        expInput.hideContainer();
        expInput.set("");

        expAlert.hide();

        expInput.state.e = null;
        expInput.state.isClean = false;
        expInput.state.isUsed = false;
      }
    },
  }
});

const juliaConstInput = new TextInput({
  id: "julia-constant",
  dispStyle: "inline",
  containerId: "julia-constant-container",
  state: {
    jc: null,
    isClean: false,
    isUsed: false,
  },
  init() {
    // Hide; container has no Element object, so we must hardcode
    this.container.style.display = "none";
  },
  eventCallbacks: {
    change() {
      this.utils.sanitize();
      resetInputs();

      // Prepare new frame based on fractal type
      queueDefaultFrame();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      juliaConstAlert.hide();
      this.state.isClean = true;
    },
    
    // Verify and accept input
    sanitize() {
      let c = Complex.parseString(this.element.value);
      if (c) {
        this.state.c = c;
        juliaConstAlert.hide();
        this.state.isClean = true;
      }
      else {
        juliaConstAlert.show();
        this.state.isClean = false;
      }
    },

    // Set to a verified clean input
    setClean(val) {
      this.element.value = val;
      this.utils.sanitize();
    },
  },
})

const juliaConstAlert = new TextElement({
  id: "julia-constant-alert",
  innerText: "Julia constant must be of the form a+bi",
  hide: true,
});

 const expInput = new TextInput({
  id: "exponent",
  dispStyle: "inline",
  containerId: "exponent-container",
  state: {
    e: null,
    isClean: false,
    isUsed: false,
  },
  init() {
    this.container.style.display = "none";
  },
  eventCallbacks: {
    change() {
      this.utils.sanitize();
      resetInputs();

      // Prepare new frame based on fractal type
      queueDefaultFrame();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      expAlert.hide();
      this.state.isClean = true;
    },
    
    // Verify and accept input
    sanitize() {
      let e = Number(this.element.value);
      if (isNaN(e) || e < 2 || !Number.isInteger(e)) {
        expAlert.show();
        this.state.isClean = false;
      }
      else {
        expAlert.hide();
        this.state.e = e;
        this.state.isClean = true;
      }
    },

    // Set to a verified clean input
    setClean(val) {
      this.element.value = val;
      this.sanitize();
    },
  },
});

const expAlert = new TextElement({
  id: "exponent-alert",
  innerText: "Exponent must be an integer greater than 1",
  hide: true,
});

const itersInput = new TextInput({
  id: "iterations",
  dispStyle: "inline",
  containerId: "iterations-container",
  value: 100,
  state: {
    iters: 100,
    isClean: true,
    isUsed: true,
  },
  eventCallbacks: {
    change() {
      this.utils.sanitize();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      itersAlert.hide();
      this.state.isClean = true;
    },

    // Verify and accept input
    sanitize() {
      let i = Number(this.element.value);
      if (isNaN(i) || i < 1) {
        itersAlert.show();
        this.state.isClean = false;
      }
      else {
        this.state.iters = i;
        this.utils.clean();
      }
    },

    // Set to a verified clean input
    setClean(val) {
      this.element.value = val;
      this.utils.sanitize();
    },
  },
});

const itersAlert = new TextElement({
  id: "iterations-alert",
  innerText: "Iterations must be a positive integer",
  hide: true,
});

const iterIncrInput = new TextInput({
  id: "iteration-increment",
  dispStyle: "inline",
  value: 100,
  state: {
    iterIncr: 100,
    isClean: true,
    // No isUsed attribute because
    // this input is not directly required
  },
  eventCallbacks: {
    change() {
      let val = Number(this.element.value);
      if (isNaN(val) || val < 1 || !Number.isInteger(val)) {
        iterIncrAlert.show();
        this.state.isClean = false;
      }
      else {
        this.state.iterIncr = val;
        iterIncrAlert.hide();
        this.state.isClean = true;
      }
    },
  },
});

const iterIncrAlert = new TextElement({
  id: "iteration-increment-alert",
  innerText: "Iteration increment must be a positive integer",
  hide: true,
});

const incrItersButton = new Button({
  id: "increase-iterations",
  eventCallbacks: {
    click() {
      if (iterIncrInput.state.isClean) {
        let newIters = itersInput.state.iters
          + iterIncrInput.state.iterIncr;
        
        itersInput.set(newIters);
        itersInput.state.iters = newIters;
        itersInput.utils.clean();
      }
    },
  },
});

const decrItersButton = new Button({
  id: "decrease-iterations",
  eventCallbacks: {
    click() {
      if (iterIncrInput.state.isClean) {
        let newIters = itersInput.state.iters
          - iterIncrInput.state.iterIncr;
        
        if (newIters > 0) {
          itersInput.set(newIters);
          itersInput.state.iters = newIters;
          itersInput.utils.clean();
        }
      }
    },
  },
});

const escapeRadiusInput = new TextInput({
  id: "escape-radius",
  containerId: "escape-radius-container",
  dispStyle: "inline",
  value: 256,
  state: {
    er: 256,
    isClean: true,
    isUsed: true,
  },
  eventCallbacks: {
    change() {
      this.utils.sanitize();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      escapeRadiusAlert.hide();
      this.state.isClean = true;
    },

    // Verify and accept input
    sanitize() {
      let er = Number(this.element.value);
      if (isNaN(er) || er < 2) {
        escapeRadiusAlert.show();
        this.state.isClean = false;
      }
      else {
        this.state.er = er;
        this.utils.clean();
      }
    },

    // Set to a verified clean input
    setClean(val) {
      this.element.value = val;
      this.utils.sanitize();
    },
  },
});

const escapeRadiusAlert = new TextElement({
  id: "escape-radius-alert",
  innerText: "Escape radius must be a number at least 2",
  hide: true,
});

const smoothColoringCheckbox = new Checkbox({
  id: "smooth-coloring",
  dispStyle: "inline",
  init() {
    this.element.checked = DEFAULTS.smoothColoring;
  },
});

const smoothColoringContainer = new Element({
  id: "smooth-coloring-container",
  eventCallbacks: {
    click() {
      let ele = smoothColoringCheckbox.element;
      ele.checked = !ele.checked;
    },
  },
});

const resetButton = new Button({
  id: "reset",
  dispStyle: "inline",
  eventCallbacks: {
    click() {
      // Reset frame, reset iters, er, etc. then render
      queueDefaultFrame();
      resetInputs();
      renderButton.utils.render();
    },
  }
});

const gradientInput = new TextInput({
  id: "gradient",
  value: DEFAULTS.gradient.getPrettifiedString(),
  state: {
    isClean: true,
    gradient: DEFAULTS.gradient,
  },
  eventCallbacks: {
    change() {
      this.utils.sanitize();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      gradientAlert.hide();
      this.state.isClean = true;
    },

    sanitize() {
      let grad;
      try {
        grad = new Gradient(this.element.value);
      }
      catch (error) {
        gradientAlert.show();
        this.state.isClean = false;
        return;
      }

      this.state.gradient = grad;
      this.element.value = grad.getPrettifiedString();

      gradientMainCanvas.state.gradient = grad;
      gradientControlCanvas.state.selected = null;
      rgbContainer.hide();
      gradientMainCanvas.utils.draw();
      gradientControlCanvas.utils.draw();

      this.utils.clean();
    },
  },
});

const gradientAlert = new TextElement({
  id: "gradient-alert",
  innerText: "There is an error in the gradient",
  hide: true,
});

const gradientMainCanvas = new Canvas({
  id: "gradient-main-canvas",
  width: 400,
  height: 75,
  init() {
    this.utils.draw();
  },
  state: {
    gradient: DEFAULTS.gradient,
  },
  utils: {
    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      let grad = this.state.gradient;

      // Draw gradient
      for (let x = 0; x < this.width + 1; x++) {
        let col = grad.getColorAt(x / this.width);
        this.ctx.fillStyle = `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
        this.ctx.fillRect(x, 0, 1, this.height - SETTINGS.gradientBarHeight);
      }
    },
  },
});

const gradientControlCanvas = new Canvas({
  id: "gradient-control-canvas",
  interactive: true,
  width: 400,
  height: 75,
  init() {
    this.utils.draw();
  },
  state: {
    selected: null,
  },
  utils: {
    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      let grad = gradientMainCanvas.state.gradient;
      let points = grad.points;

      // Draw bar underneath
      let numPoints = points.length;
      let start = 0;
      this.state.positions = [0];
      for (let i = 0; i < numPoints; i++) {
        let col = points[i].color;
        this.ctx.fillStyle = `rgb(${col[0]}, ${col[1]}, ${col[2]})`;

        let avg = i == numPoints - 1 ? 1 : (points[i].pos + points[i + 1].pos) / 2;

        let params = [
          Math.round(start * this.width), this.height - SETTINGS.gradientBarHeight,
          Math.ceil((avg - start) * this.width), SETTINGS.gradientBarHeight
        ];

        this.ctx.fillRect(...params);

        if (
          i == this.state.selected ||
          (this.state.selected == 0 && i == numPoints - 1) ||
          (this.state.selected == numPoints - 1 && i == 0)
        ) {
          this.ctx.strokeStyle = col[0] + col[1] + col[2] < 383 ? "#FFFFFF" : "#000000";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(params[0] + 1, params[1] + 1, params[2] - 2, params[3] - 2);
        }

        start = avg
        this.state.positions.push(avg);
      }
    },

    modifySelectedColor(i, n) {
      let grad = gradientMainCanvas.state.gradient;
      let selected = this.state.selected;
      grad.points[selected].color[i] = n;
      grad.updateString();

      gradientMainCanvas.utils.draw();
      this.utils.draw();

      gradientInput.state.gradient = grad;
      gradientInput.element.value = grad.getPrettifiedString();
    },
  },
  eventCallbacks: {
    mouseUp() {
      if (this.state.mouseY > this.height - SETTINGS.gradientBarHeight) {
        for (let i = 0; i < this.state.positions.length - 1; i++) {
          let normX = this.state.mouseX / this.width
          if (this.state.positions[i] < normX && normX < this.state.positions[i + 1]) {
            if (this.state.selected == i) {
              this.state.selected = null;
              this.utils.draw();
              rgbContainer.hide();
            }
            else {
              this.state.selected = i;
              this.utils.draw();
              rgbContainer.utils.setSliders(
                ...gradientMainCanvas.state.gradient.points[i].color
              );
              rgbContainer.show();
            }
            break;
          }
        }
      }
    },
  },
});

const rgbContainer = new Element({
  id: "rgb-container",
  hide: true,
  utils: {
    setSliders(r, g, b) {
      rSlider.element.value = r;
      gSlider.element.value = g;
      bSlider.element.value = b;
    },
  },
});

const rSlider = new Slider({
  id: "color-r",
  dispStyle: "inline",
  eventCallbacks: {
    input() {
      gradientControlCanvas.utils.modifySelectedColor(0, Number(this.element.value));
    }
  },
});

const gSlider = new Slider({
  id: "color-g",
  dispStyle: "inline",
  eventCallbacks: {
    input() {
      gradientControlCanvas.utils.modifySelectedColor(1, Number(this.element.value));
    }
  },
});

const bSlider = new Slider({
  id: "color-b",
  dispStyle: "inline",
  eventCallbacks: {
    input() {
      gradientControlCanvas.utils.modifySelectedColor(2, Number(this.element.value));
    }
  },
});


const resizeButton = new Button({
  id: "resize",
  eventCallbacks: {
    click() {
      if (!renderInProgress) {
        let dim = [
          window.innerWidth - CSSpxToNumber(toolbar.element.style.width),
          window.innerHeight
        ];
        mainCanvas.setDim(...dim);
        controlCanvas.setDim(...dim);

        currSettings.setRes(...dim);
        render(currSettings, false);
      }
    },
  },
});

const settingsJsonInput = new TextInput({
  id: "settings-json",
});

const importSettingsButton = new Button({
  id: "import-settings",
  eventCallbacks: {
    click() {
      let str = settingsJsonInput.element.value;
      let obj = JSON.parse(str);
      render(obj);
    },
  },
});

function resetInputs() {
  itersInput.set(DEFAULTS.iters);
  itersInput.state.iters = DEFAULTS.iters;
  itersInput.utils.clean();

  escapeRadiusInput.set(DEFAULTS.escapeRadius);
  escapeRadiusInput.state.er = DEFAULTS.escapeRadius;
  escapeRadiusInput.utils.clean();
}

// Initial render
renderButton.utils.render();
