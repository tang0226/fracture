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
        this.reMin + (this.reWidth * x / _width),
        this.imMin + (this.imHeight * y / _height)
    );
};


// Get zoom based on size of frame
Frame.prototype.toZoom = function() {
    return Number.parseFloat(1 / this.reWidth).toExponential(10);
};


// Return a frame that matches canvas aspect ratio
Frame.prototype.fitToCanvas = function() {
    if(this.reWidth / this.imHeight > _width / _height) {
        return new Frame(
            this.center,
            this.reWidth,
            this.reWidth * _height / _width
        );
    }
    else {
        return new Frame(
            this.center,
            this.imHeight * _width / _height,
            this.imHeight
        );
    }
};
