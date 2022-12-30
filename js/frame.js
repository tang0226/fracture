/******************************
FRAME PROTOTYPE: REGION ON THE COMPLEX PLANE
******************************/

var Frame = function(center, reWidth, imHeight) {
    this.center = center;
    this.reWidth = reWidth;
    this.imHeight = imHeight;
    this.reMin = this.center.re - reWidth / 2;
    this.imMin = this.center.im - imHeight / 2;
};


// Translate xy coordinates on the canvas
// to coordinates on the complex plane.
Frame.prototype.toComplexCoords = function(x, y){
    return Complex(
        this.reMin + (this.reWidth * x / canvasWidth),
        this.imMin + (this.imHeight * y / canvasHeight)
    );
};


// Get zoom based on size of frame
Frame.prototype.toZoom = function() {
    return Number.parseFloat(1 / this.reWidth).toExponential(10);
};


// Return a frame that matches canvas aspect ratio
Frame.prototype.fitToCanvas = function() {
    if(this.reWidth / this.imHeight > canvasWidth / canvasHeight) {
        return new Frame(
            this.center,
            this.reWidth,
            this.reWidth * canvasHeight / canvasWidth
        );
    }
    else {
        return new Frame(
            this.center,
            this.imHeight * canvasWidth / canvasHeight,
            this.imHeight
        );
    }
};
