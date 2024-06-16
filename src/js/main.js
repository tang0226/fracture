const DEFAULTS = {
  toolbarWidth: 500,

  fractals: {
    mandelbrot: new Fractal("Mandelbrot"),
    julia: new Fractal("Julia", {
      c: Complex(0, 1),
    }),
    multibrot: new Fractal("Multibrot", {
      e: 3,
    }),
    multijulia: new Fractal("Multijulia", {
      e: 3,
      c: Complex(0, 1),
    }),
    burningShip: new Fractal("BurningShip"),
    burningShipJulia: new Fractal("BurningShipJulia", {
      c: Complex(0, 1),
    }),
    multiship: new Fractal("Multiship", {
      e: 3,
    }),
    multishipJulia: new Fractal("MultishipJulia", {
      e: 3,
      c: Complex(0, 1),
    }),
    tricorn: new Fractal("Tricorn"),
  },

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
  fractal: DEFAULTS.fractals.mandelbrot.copy(),
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
            this.linked.progress.set(percent + "%");
            this.linked.progressBar.set(percent);
            this.state.progress = percent;

            this.linked.renderTime.set(msToTime(data.renderTime));
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
          this.linked.progress.set(this.state.progress + "%" + " (cancelled)");
        }
      }
    },
  },
});

const controlCanvas = Canvas({
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

      let frame = this.linked.mainCanvas.state.currSettings.frame;
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
        
        let img = this.linked.mainCanvas.state.currSettings.copy();
        img.setSrcFrame(newSrcFrame);

        this.linked.mainCanvas.utils.cancelRender(true);
        this.linked.mainCanvas.utils.render(img);
      }
    },
    mouseOut() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    },
  },
});

const progress = new TextElement({
  id: "progress",
  dispStyle: "inline",
  innerText: "0%",
});

const progressBar = ProgressBar({
  id: "progress-bar",
});

const renderTime = new TextElement({
  id: "render-time",
  dispStyle: "inline",
});

const render = new Button({
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
          pascalToCamel(this.linked.fractalType.element.value)
        ] || DEFAULTS.srcFrame;
    },

    render() {
      let canvas = this.linked.canvas,
        frac = this.linked.fractalType,
        c = this.linked.juliaConstant,
        e = this.linked.exponent,
        iters = this.linked.iterations,
        er = this.linked.escapeRadius;
        sc = this.linked.smoothColoring;
      
      if (canvas.state.rendering) return;

      let canRender = true;

      // check conditional inputs
      if (c.state.isUsed && !c.state.isClean) {
        c.linked.alert.show();
        canRender = false;
      }
      if (e.state.isUsed && !e.state.isClean) {
        e.linked.alert.show();
        canRender = false;
      }

      // check other inputs
      if (!iters.state.isClean || !er.state.isClean) {
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
          frame = this.linked.canvas.state.currSettings.srcFrame;
        }

        let settings = {
          width: canvas.width,
          height: canvas.height,
          fractal: new Fractal(
            frac.state.fractal.id,
            {
              c: c.state.c || undefined,
              e: e.state.e || undefined,
            },
          ),
          iterSettings: {
            iters: iters.state.iters,
            escapeRadius: er.state.er,
            smoothColoring: sc.element.checked,
          },
          srcFrame: frame,
          gradient: DEFAULTS.gradient,
          gradientSettings: { itersPerCycle: null},
        };
        
        canvas.utils.render(settings);
      }
    },
  },
});

const cancel = new Button({
  id: "cancel",
  dispStyle: "inline",
  eventCallbacks: {
    click() {
      this.linked.canvas.utils.cancelRender();
    },
  },
});

const fractalType = new Dropdown({
  id: "fractal-type",
  dispStyle: "inline",
  containerId: "fractal-select-container",
  value: "Mandelbrot",
  state: {
    fractal: DEFAULTS.fractals.mandelbrot.copy(),
  },
  eventCallbacks: {
    change() {
      let newFractal = DEFAULTS.fractals[pascalToCamel(this.element.value)].copy();
      this.state.fractal = {
        id: newFractal.id,
        meta: newFractal.meta,
      };
      this.utils.updateParameterDisplays();
      this.utils.resetInputs();
    },
  },
  utils: {
    updateParameterDisplays() {
      let l = this.linked
      if (this.state.fractal.meta.reqJuliaConst) {
        l.juliaConstant.showContainer();
        l.juliaConstant.state.isUsed = true;
      }
      else {
        l.juliaConstant.hideContainer();
        l.juliaConstant.set("");

        l.juliaConstantAlert.hide();

        l.juliaConstant.state.jc = null;
        l.juliaConstant.state.isClean = false;
        l.juliaConstant.state.isUsed = false;
      }
      if (this.state.fractal.meta.reqExponent) {
        l.exponent.showContainer();
        l.exponent.state.isUsed = true;
      }
      else {
        l.exponent.hideContainer();
        l.exponent.set("");

        l.exponentAlert.hide();

        l.exponent.state.e = null;
        l.exponent.state.isClean = false;
        l.exponent.state.isUsed = false;
      }
    },

    resetInputs() {
      let l = this.linked;
      
      l.iters.set(DEFAULTS.iters);
      l.iters.state.iters = DEFAULTS.iters;
      l.iters.utils.clean();

      l.er.set(DEFAULTS.escapeRadius);
      l.er.state.er = DEFAULTS.escapeRadius;
      l.er.utils.clean();

      // Prepare new frame based on fractal type selected
      l.render.utils.queueDefaultFrame();
    },
  }
});

const juliaConstant = new TextInput({
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
      this.linked.fractalType.utils.resetInputs();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      this.linked.alert.hide();
      this.state.isClean = true;
    },
    
    // Verify and accept input
    sanitize() {
      let c = Complex.parseString(this.element.value);
      if (c) {
        this.state.c = c;
        this.linked.alert.hide();
        this.state.isClean = true;
      }
      else {
        this.linked.alert.show();
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

const juliaConstantAlert = new TextElement({
  id: "julia-constant-alert",
  innerText: "Julia constant must be of the form a+bi",
  hide: true,
});

 const exponent = new TextInput({
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
      this.linked.fractalType.utils.resetInputs();
    },
  },
  utils: {
    // Mark self as valid
    clean() {
      this.linked.alert.hide();
      this.state.isClean = true;
    },
    
    // Verify and accept input
    sanitize() {
      let e = Number(this.element.value);
      if (isNaN(e) || e < 2 || !Number.isInteger(e)) {
        this.linked.alert.show();
        this.state.isClean = false;
      }
      else {
        this.linked.alert.hide();
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

const exponentAlert = new TextElement({
  id: "exponent-alert",
  innerText: "Exponent must be an integer greater than 1",
  hide: true,
});

const iterations = new TextInput({
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
      this.linked.alert.hide();
      this.state.isClean = true;
    },

    // Verify and accept input
    sanitize() {
      let i = Number(this.element.value)
      if (isNaN(i) || i < 1) {
        this.linked.alert.show();
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

const iterationsAlert = new TextElement({
  id: "iterations-alert",
  innerText: "Iterations must be a positive integer",
  hide: true,
});

const iterationIncrement = new TextInput({
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
      let val = val;
      if (isNaN(val) || val < 1) {
        this.linked.alert.show();
        this.state.isClean = false;
      }
      else {
        this.state.iterIncr = val;
        this.linked.alert.hide();
        this.state.isClean = true;
      }
    },
  },
});

const iterationIncrementAlert = new TextElement({
  id: "iteration-increment-alert",
  innerText: "Iteration increment must be a positive integer",
  hide: true,
});

const increaseIterations = new Button({
  id: "increase-iterations",
  eventCallbacks: {
    click() {
      if (this.linked.iterIncr.state.isClean) {
        let newIters = this.linked.iters.state.iters
          + this.linked.iterIncr.state.iterIncr;
        
        this.linked.iters.set(newIters);
        this.linked.iters.state.iters = newIters;
        this.linked.iters.utils.clean();
      }
    },
  },
});

const decreaseIterations = new Button({
  id: "decrease-iterations",
  eventCallbacks: {
    click() {
      if (this.linked.iterIncr.state.isClean) {
        let newIters = this.linked.iters.state.iters
          - this.linked.iterIncr.state.iterIncr;
        
        if (newIters > 0) {
          this.linked.iters.set(newIters);
          this.linked.iters.state.iters = newIters;
          this.linked.iters.utils.clean();
        }
      }
    },
  },
});

const escapeRadius = new TextInput({
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
      this.linked.alert.hide();
      this.state.isClean = true;
    },

    // Verify and accept input
    sanitize() {
      let er = Number(this.element.value);
      if (isNaN(er) || er < 2) {
        this.linked.alert.show();
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
}),

const smoothColoring = new Checkbox({
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
      let ele = this.linked.smoothColoring.element;
      ele.checked = !ele.checked;
    },
  },
});

const reset = new Button({
  id: "reset",
  dispStyle: "inline",
  eventCallbacks: {
    click() {
      // Reset frame, reset iters, er, etc. then render
      this.linked.render.utils.queueDefaultFrame();
      this.linked.fractalType.utils.resetInputs();
      this.linked.render.utils.render();
    },
  }
});

const resize = new Button({
  id: "resize",
  eventCallbacks: {
    click() {
      if (!this.linked.mainCanvas.state.rendering) {
        let dim = [
          window.innerWidth - CSSpxToNumber(this.linked.toolbar.element.style.width),
          window.innerHeight
        ];
        this.linked.mainCanvas.setDim(...dim);
        this.linked.controlCanvas.setDim(...dim);

        this.linked.render.utils.render();
      }
    },
  },
});

const settingsJson = new TextInput({
  id: "settings-json",
});

const importSettings = new Button({
  id: "import-settings",
  eventCallbacks: {
    click() {
      let str = this.linked.settingsJson.element.value;
      let obj = JSON.parse(str);
      this.linked.canvas.utils.render(obj);
    },
  },
});

// Initial render
elements.render.utils.render();
