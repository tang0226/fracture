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
const FRACTALS = {
  mandelbrot: new Fractal("Mandelbrot"),
  julia: new Fractal("Julia", {
    c: Complex(0, 1),
  }),
  multibrot: new Fractal("Multibrot", {
    e: 3,
  }),
};

// Frames
const DEFAULT_VIEW = new Frame(Complex(0, 0), 4, 4);


// Gradent

const DEFAULT_GRADIENT = new Gradient(
  "2; 0, 0 0 0; 1, 255 255 255;"
);

var image = new ImageSettings({
  width: canvas.width,
  height: canvas.height,
  fractal: FRACTALS.mandelbrot.copy(),
  fractalSettings: {
    iters: 1000,
    escapeRadius: 256,
  },
  srcFrame: new Frame([-0.5, 0], 4, 4),
  gradient: DEFAULT_GRADIENT,
  gradientSettings: { itersPerCycle: null},
  colorSettings: { smoothColoring: true},
});


// Define elements first, before links
const UI = {
  elements: {
    mainCanvas: new Canvas({
      id: "main-canvas",
      state: {
        currSettings: ImageSettings.reconstruct(image),
      },
      utils: {
        render: function(imageSettings, renderSettings) {
          this.state.lastSettings = ImageSettings.reconstruct(this.state.currSettings);
          this.state.currSettings = ImageSettings.reconstruct(imageSettings);
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

        cancelRender: function(skipMsg) {
          if (this.state.rendering) {
            this.state.renderWorker.terminate();
            this.state.rendering = false;
            if (!skipMsg) {
              this.linked.progress.set(this.state.progress + "%" + " (cancelled)");
            }
          }
        },
      },
    }),

    controlCanvas: new Canvas({
      id: "control-canvas",
      interactive: true,
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
    }),

    progress: new TextElement({
      id: "progress",
      dispStyle: "inline",
      innerText: "0%",
    }),

    progressBar: new ProgressBar({
      id: "progress-bar",
    }),

    renderTime: new TextElement({
      id: "render-time",
      dispStyle: "inline",
    }),

    render: new Button({
      id: "render",
      dispStyle: "inline",
      eventCallbacks: {
        click() {
          this.utils.render();
        },
      },
      utils: {
        render() {
          let canvas = this.linked.canvas,
            frac = this.linked.fractalType,
            c = this.linked.juliaConstant,
            e = this.linked.exponent,
            iters = this.linked.iterations,
            er = this.linked.escapeRadius;
            
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
            let last = this.linked.canvas.state.currSettings;
            let settings = {
              width: canvas.width,
              height: canvas.height,
              fractal: new Fractal(
                frac.state.fractalType,
                {
                  c: c.state.c || undefined,
                  e: e.state.e || undefined,
                },
              ),
              fractalSettings: {
                iters: iters.state.iters,
                escapeRadius: er.state.er,
              },
              srcFrame: last.srcFrame,
              gradient: DEFAULT_GRADIENT,
              gradientSettings: { itersPerCycle: null},
              colorSettings: { smoothColoring: true},
            };
            

            canvas.utils.render(settings);
          }
        },
      },
    }),

    cancel: new Button({
      id: "cancel",
      dispStyle: "inline",
      eventCallbacks: {
        click() {
          this.linked.canvas.utils.cancelRender();
        },
      },
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
          let newFractal = FRACTALS[this.element.value.toLowerCase()];
          this.state.fractalType = newFractal.name; // check this
          if (newFractal.meta.reqJuliaConst) {
            this.linked.juliaConstant.showContainer();
            this.linked.juliaConstant.state.isUsed = true;
          }
          else {
            this.linked.juliaConstant.hideContainer();
            this.linked.juliaConstant.set("");
            this.linked.juliaConstant.jc = null;
            this.linked.juliaConstantAlert.hide();
            this.linked.juliaConstant.state.isClean = false;
            this.linked.juliaConstant.state.isUsed = false;
          }
          if (newFractal.meta.reqExponent) {
            this.linked.exponent.showContainer();
            this.linked.exponent.state.isUsed = true;
          }
          else {
            this.linked.exponent.hideContainer();
            this.linked.exponent.set("");
            this.linked.exponent.e = null;
            this.linked.exponentAlert.hide();
            this.linked.exponent.state.isClean = false;
            this.linked.exponent.state.isUsed = false;
          }
        },
      },
    }),

    juliaConstant: new TextInput({
      id: "julia-constant",
      dispStyle: "inline",
      containerId: "julia-constant-container",
      state: {
        jc: null,
        isClean: false,
        isUsed: false,
      },
      eventCallbacks: {
        change() {
          this.utils.sanitize();
        },
      },
      utils: {
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
      state: {
        e: null,
        isClean: false,
        isUsed: false,
      },
      eventCallbacks: {
        change() {
          this.utils.sanitize();
        },
      },
      utils: {
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
        isUsed: true,
      },
      eventCallbacks: {
        change() {
          this.utils.sanitize();
        },
      },
      utils: {
        clean() {
          this.linked.alert.hide();
          this.state.isClean = true;
        },
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
        // No isUsed attribute because
        // this input is not directly required
      },
      eventCallbacks: {
        change() {
          if (isNaN(Number(this.element.value)) || Number(this.element.value) < 1) {
            this.linked.alert.show();
            this.state.isClean = false;
          }
          else {
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
        isUsed: true,
      },
      eventCallbacks: {
        change() {
          this.utils.sanitize();
        },
      },
      utils: {
        sanitize() {
          let er = Number(this.element.value)
          if (isNaN(er) || er < 2) {
            this.linked.alert.show();
            this.state.isClean = false;
          }
          else {
            this.state.er = er;
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

    settingsJson: new TextInput({
      id: "settings-json",
    }),

    importSettings: new Button({
      id: "import-settings",
      eventCallbacks: {
        click() {
          let str = this.linked.settingsJson.element.value;
          let obj = JSON.parse(str);
          console.log(str, obj);
          this.linked.canvas.utils.render(obj);
        },
      },
    }),
  },
};

// Alias for elements object
var elements = UI.elements;

// Define links here
elements.render.link("canvas", elements.mainCanvas);
elements.render.link("fractalType", elements.fractalType);
elements.render.link("juliaConstant", elements.juliaConstant);
elements.render.link("exponent", elements.exponent);
elements.render.link("iterations", elements.iterations);
elements.render.link("escapeRadius", elements.escapeRadius);

elements.cancel.link("canvas", elements.mainCanvas);

elements.mainCanvas.link("progress", elements.progress);
elements.mainCanvas.link("progressBar", elements.progressBar);
elements.mainCanvas.link("renderTime", elements.renderTime);

elements.controlCanvas.link("mainCanvas", elements.mainCanvas);

elements.fractalType.link("juliaConstant", elements.juliaConstant);
elements.fractalType.link("juliaConstantAlert", elements.juliaConstantAlert);
elements.fractalType.link("exponent", elements.exponent);
elements.fractalType.link("exponentAlert", elements.exponentAlert);

elements.juliaConstant.link("alert", elements.juliaConstantAlert);

elements.exponent.link("alert", elements.exponentAlert);

elements.iterations.link("alert", elements.iterationsAlert);

elements.iterationIncrement.link("alert", elements.iterationIncrementAlert);

elements.increaseIterations.link("iters", elements.iterations);
elements.increaseIterations.link("iterIncr", elements.iterationIncrement);

elements.decreaseIterations.link("iters", elements.iterations);
elements.decreaseIterations.link("iterIncr", elements.iterationIncrement);

elements.escapeRadius.link("alert", elements.escapeRadiusAlert);

elements.importSettings.link("settingsJson", elements.settingsJson);
elements.importSettings.link("canvas", elements.mainCanvas);

// Initial render
elements.render.utils.render();
