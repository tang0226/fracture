const DEFAULTS = {
  toolbarWidth: 500,

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
    "2; 0, 0 0 0; 1, 255 255 255;"
  ),
};

DEFAULTS.imageSettings = new ImageSettings({
  width: window.innerWidth - DEFAULTS.toolbarWidth,
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



// Define elements first, before links
const toolbar = new Element({
  id: "toolbar",
  init() {
    this.element.style.width = DEFAULTS.toolbarWidth + "px";
  },
});

const mainCanvas = new Canvas({
  id: "main-canvas",
  state: {
    currSettings: ImageSettings.reconstruct(DEFAULTS.imageSettings),
  },
  init() {
    this.setDim(window.innerWidth - DEFAULTS.toolbarWidth, window.innerHeight);
  },
  utils: {
    pushSettings(newSettings) {
      this.state.lastSettings = ImageSettings.reconstruct(this.state.currSettings);
      this.state.currSettings = ImageSettings.reconstruct(newSettings);
    },

    render(imageSettings, renderSettings) {
      this.utils.pushSettings(imageSettings);
      this.state.rendering = true;

      this.state.renderWorker = new Worker("./js/render-worker.js");

      this.state.renderWorker.onmessage = function(event) {
        let data = event.data;
        switch (data.type) {
          case "update":
            this.ctx.putImageData(data.imgData, data.x, data.y);
            break;

          case "progress":
            let percent = Math.floor(data.y / data.h * 100);
            progressDisp.set(percent + "%");
            progressBar.set(percent);
            this.state.progress = percent;

            renderTime.set(msToTime(data.renderTime));
            this.state.renderTime = data.renderTime;
            break;

          case "done":
            this.state.rendering = false;
        }
      }.bind(this);

      this.state.renderWorker.postMessage({
        msg: "draw",
        settings: JSON.parse(JSON.stringify(imageSettings)),
      });
    },

    cancelRender(skipMsg) {
      if (this.state.rendering) {
        this.state.renderWorker.terminate();
        this.state.rendering = false;
        if (!skipMsg) {
          progressDisp.set(this.state.progress + "%" + " (cancelled)");
        }
      }
    },
  },
});

const controlCanvas = new Canvas({
  id: "control-canvas",
  interactive: true,
  init() {
    this.setDim(window.innerWidth - DEFAULTS.toolbarWidth, window.innerHeight);
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

      let frame = mainCanvas.state.currSettings.frame;
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
        
        let img = mainCanvas.state.currSettings.copy();
        img.setSrcFrame(newSrcFrame);

        mainCanvas.utils.cancelRender(true);
        mainCanvas.utils.render(img);
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

const renderTime = new TextElement({
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
    // Set frame for new redraw (when changing fractals)
    queueDefaultFrame() {
      this.state.queuedFrame =
        DEFAULTS.specialSrcFrame[
          pascalToCamel(fractalDropdown.element.value)
        ] || DEFAULTS.srcFrame;
    },

    render() {
      if (mainCanvas.state.rendering) return;
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
      if (!itersInput.state.isClean || !escapeRadiusInput.state.isClean) {
        canRender = false;
      }

      if (canRender) {
        let frame;

        // If fractal changed and new frame is queued
        if (this.state.queuedFrame) {
          frame = this.state.queuedFrame;
          this.state.queuedFrame = null;
        }
        // Otherwise, stick to current frame
        else {
          frame = mainCanvas.state.currSettings.srcFrame;
        }
        
        let settings = {
          width: mainCanvas.width,
          height: mainCanvas.height,
          fractal: new Fractal(
            FRACTAL_TYPES[fractalDropdown.state.fractalType.id],
            {
              c: juliaConstInput.state.c || undefined,
              e: expInput.state.e || undefined,
            },
          ),
          iterSettings: {
            iters: itersInput.state.iters,
            escapeRadius: escapeRadiusInput.state.er,
            smoothColoring: smoothColoringCheckbox.element.checked,
          },
          srcFrame: frame,
          gradient: DEFAULTS.gradient,
          gradientSettings: { itersPerCycle: null},
        };
        mainCanvas.utils.render(settings);
      }
    },
  },
});

const cancelButton = new Button({
  id: "cancel",
  dispStyle: "inline",
  eventCallbacks: {
    click() {
      mainCanvas.utils.cancelRender();
    },
  },
});

const fractalDropdown = new Dropdown({
  id: "fractal-type",
  dispStyle: "inline",
  containerId: "fractal-select-container",
  value: "Mandelbrot",
  state: {
    fractalType: FRACTAL_TYPES.mandelbrot,
  },
  eventCallbacks: {
    change() {
      this.state.fractalType = FRACTAL_TYPES[pascalToCamel(this.element.value)];
      this.utils.updateParameterDisplays();
      this.utils.resetInputs();
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

    resetInputs() {
      itersInput.set(DEFAULTS.iters);
      itersInput.state.iters = DEFAULTS.iters;
      itersInput.utils.clean();

      escapeRadiusInput.set(DEFAULTS.escapeRadius);
      escapeRadiusInput.state.er = DEFAULTS.escapeRadius;
      escapeRadiusInput.utils.clean();
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
      fractalDropdown.utils.resetInputs();

      // Prepare new frame based on fractal type
      renderButton.utils.queueDefaultFrame();
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
      fractalDropdown.utils.resetInputs();

      // Prepare new frame based on fractal type
      renderButton.utils.queueDefaultFrame();
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
      let i = Number(this.element.value)
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
      renderButton.utils.queueDefaultFrame();
      fractalDropdown.utils.resetInputs();
      renderButton.utils.render();
    },
  }
});

const resizeButton = new Button({
  id: "resize",
  eventCallbacks: {
    click() {
      if (!mainCanvas.state.rendering) {
        let dim = [
          window.innerWidth - CSSpxToNumber(toolbar.element.style.width),
          window.innerHeight
        ];
        mainCanvas.setDim(...dim);
        controlCanvas.setDim(...dim);

        renderButton.utils.render();
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
      mainCanvas.utils.render(obj);
    },
  },
});

// Initial render
renderButton.utils.render();
