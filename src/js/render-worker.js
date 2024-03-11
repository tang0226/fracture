importScripts(
  "./fractals/complex.js",
  "./fractals/fractal.js",
  "./fractals/frame.js",
  "./fractals/gradient.js",
  "./fractals/image-settings.js",
);

function scale(n, minFrom, maxFrom, minTo, maxTo) {
  return ((n / (maxFrom - minFrom)) * (maxTo - minTo)) + minTo;
};

onmessage = function(event) {
  let data = event.data;
  if (data.msg == "draw") {
    let startTime = new Date();
    let renderTime;

    let settings = ImageSettings.reconstruct(data.settings);
    let imgData = new ImageData(settings.width, settings.height);
    let i = 0;
    for (let y = 0; y < settings.height; y++) {
      let im = settings.frame.imMin + y * settings.complexIter;
      for (let x = 0; x < settings.width; x++) {
        let val = settings.fractal.iterFunc(
          [
            settings.frame.reMin + x * settings.complexIter,
            settings.frame.imMin + y * settings.complexIter
          ],
          settings
        );
        if (val == settings.fractalSettings.iters) {
          imgData.data[i] = 0;
          imgData.data[i + 1] = 0;
          imgData.data[i + 2] = 0;
          imgData.data[i + 3] = 255;
        }
        else {
          let bw = 255 * val / settings.fractalSettings.iters;
          imgData.data[i] = bw;
          imgData.data[i + 1] = bw;
          imgData.data[i + 2] = bw;
          imgData.data[i + 3] = 255;          
        }

        i += 4;
      }
    }
    postMessage({
      type: "done",
      imgData: imgData,
    });
    /**
    let ipc = img.itersPerCycle;
    let imgData = new ImageData(img.width, img.height);

    let i = 0;
    for(let currY = 0; currY < img.height; currY++) {
      let im = img.frame.imMin + currY * img.complexIter;

      for(let currX = 0; currX < img.width; currX++) {
        let val = iterate(
          img.fractal.params,
          Complex(img.frame.reMin + currX * img.complexIter, im),
          img.iterations,
          img.escapeRadius,
          img.smoothColoring
        );

        if(val == img.iterations) {
          // Part of set, color black
          imgData.data[i] = 0;
          imgData.data[i + 1] = 0;
          imgData.data[i + 2] = 0;
          imgData.data[i + 3] = 255;
        }
        else {

          // Format for palette
          val %= ipc;

          // Color scale
          let color = Palette.getColorAt(img.palette, val / ipc);
          imgData.data[i] = color[0];
          imgData.data[i + 1] = color[1];
          imgData.data[i + 2] = color[2];
          imgData.data[i + 3] = 255;
        }

        i += 4;
      }

      // Update render time
      renderTime = new Date() - startTime;

      postMessage({
        type: "progress",
        progress: i / 4 / (img.width * img.height) * 100,
        renderTime: renderTime
      });
    }

    **/

  }
};
