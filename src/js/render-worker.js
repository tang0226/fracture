importScripts(
  "./utils.js",
  "./fractals/complex.js",
  "./fractals/fractal.js",
  "./fractals/frame.js",
  "./fractals/gradient.js",
  "./fractals/image-settings.js",
);

onmessage = function(event) {
  let data = event.data;
  if (data.msg == "draw") {
    let startTime = new Date();
    let lastUpdateTime = new Date();

    let settings = ImageSettings.reconstruct(data.settings);

    let iterate = settings.fractal.meta.iterationType == "mandelbrot" ?
      Fractal.iterateMandelbrot : Fractal.iterateJulia;
    
    let iterSettings = {...settings.iterSettings};
    iterSettings.c = settings.fractal.constants.c;

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
            settings.fractal.constants.e || 2
          );
        if (val == settings.iterSettings.iters) {
          currChunk[i] = 0;
          currChunk[i + 1] = 0;
          currChunk[i + 2] = 0;
          currChunk[i + 3] = 255;
        }
        else {
          let bw = 255 * val / settings.iterSettings.iters;
          currChunk[i] = bw;
          currChunk[i + 1] = bw;
          currChunk[i + 2] = bw;
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
