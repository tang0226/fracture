/******************************
FRAME PROTOTYPE: REGION ON THE COMPLEX PLANE
******************************/

function Frame(center, reWidth, imHeight) {
    this.center = center;
    this.reWidth = reWidth;
    this.imHeight = imHeight;
    this.reMin = this.center.re - reWidth / 2;
    this.imMin = this.center.im - imHeight / 2;
};


// Translate xy coordinates on the canvas
// to coordinates on the complex plane.
Frame.prototype.toComplexCoords = function(x, y, w, h){
    return Complex(
        this.reMin + (this.reWidth * x / w),
        this.imMin + (this.imHeight * y / h)
    );
};


// Get zoom based on size of frame
Frame.prototype.toZoom = function() {
    return Number.parseFloat(1 / this.reWidth).toExponential(10);
};


// Return a frame that matches canvas aspect ratio
Frame.prototype.fitToCanvas = function(w, h) {
    if(this.reWidth / this.imHeight > w / h) {
        return new Frame(
            this.center,
            this.reWidth,
            this.reWidth * h / w
        );
    }
    else {
        return new Frame(
            this.center,
            this.imHeight * w / h,
            this.imHeight
        );
    }
};
