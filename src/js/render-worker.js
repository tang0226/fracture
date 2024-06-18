importScripts(
  "./utils.js",
  "./classes/complex.js",
  "./classes/fractal.js",
  "./classes/fractal-type.js",
  "./classes/frame.js",
  "./classes/gradient.js",
  "./classes/image-settings.js",
  "./constants/fractal-types.js",
);

onmessage = function(event) {
  let data = event.data;
  if (data.msg == "draw") {
    let startTime = new Date();
    let lastUpdateTime = new Date();

    let settings = ImageSettings.reconstruct(data.settings);

    let iterate = settings.fractal.type.meta.iterationType == "mandelbrot" ?
      Fractal.iterateMandelbrot : Fractal.iterateJulia;
    
    let iterSettings = {...settings.iterSettings};
    iterSettings.smoothColoringExp = settings.fractal.params.e || 2;

    let currChunk = [];
    let currChunkHeight = 0;
    let currChunkY = 0;

    let i = 0;
    for (let y = 0; y < settings.height; y++) {
      let im = settings.frame.imMin + y * settings.complexIter;
      for (let x = 0; x < settings.width; x++) {
        let val = iterate(
            [
              settings.frame.reMin + x * settings.complexIter,
              settings.frame.imMin + y * settings.complexIter
            ],
            settings.fractal.iterFunc,
            iterSettings,
            settings.fractal.params,
          );
        if (val == settings.iterSettings.iters) {
          currChunk[i] = 0;
          currChunk[i + 1] = 0;
          currChunk[i + 2] = 0;
          currChunk[i + 3] = 255;
        }
        else {
          let col = settings.gradient.getColorAt(val / settings.iterSettings.iters);
          currChunk[i] = col[0];
          currChunk[i + 1] = col[1];
          currChunk[i + 2] = col[2];
          currChunk[i + 3] = 255;          
        }

        i += 4;
      }

      currChunkHeight++;

      let t = new Date() - lastUpdateTime;
      if (t >= 200 || y == settings.height - 1) {
        postMessage({
          type: "update",
          imgData: new ImageData(
            new Uint8ClampedArray(currChunk),
            settings.width, currChunkHeight
          ),
          x: 0,
          y: currChunkY,
        });
        currChunk = [];
        i = 0;
        currChunkHeight = 0;
        currChunkY = y + 1;
        lastUpdateTime = new Date();
      }

      postMessage({
        type: "progress",
        y: y + 1,
        h: settings.height,
        renderTime: new Date() - startTime,
      });
    }

    postMessage({
      type: "done",
    });
  }
};
