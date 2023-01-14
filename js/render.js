importScripts("./complex.js", "./fractal.js");

var scale = function(n, minFrom, maxFrom, minTo, maxTo) {
    return ((n / (maxFrom - minFrom)) * (maxTo - minTo)) + minTo;
};

onmessage = function(event) {
    let data = event.data;
    if(data.type == "draw") {
        let startTime = new Date();
        let renderTime;

        let img = data.img;
        let iterate = Fractal.iterate[img.fractal.type];

        let imgData = new ImageData(img.width, img.height);

        let im = img.frame.imMin;
        let i = 0;
        for(let currY = 0; currY < img.height; currY++) {
            let re = img.frame.reMin;

            for(let currX = 0; currX < img.width; currX++) {
                let val = iterate(
                    img.fractal.params,
                    Complex(re, im),
                    img.iterations,
                    img.escapeRadius
                );

                let bw;
                if(val == img.iterations) {
                    // Part of set, color black
                    bw = 0;
                }
                else {
                    // Color scale
                    bw = scale(val, 0, img.iterations, 0, 255);
                }

                imgData.data[i] = bw;
                imgData.data[i + 1] = bw;
                imgData.data[i + 2] = bw;
                imgData.data[i + 3] = 255;

                re += img.complexIter;
                i += 4;
            }
            im += img.complexIter;

            // Update render time
            renderTime = new Date() - startTime;

            postMessage({
                type: "progress",
                progress: i / 4 / (img.width * img.height) * 100,
                renderTime: renderTime
            });
        }

        postMessage({
            type: "done",
            imgData: imgData,
            renderTime: renderTime
        });
    }
};
