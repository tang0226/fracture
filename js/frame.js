/******************************
FRAME PROTOTYPE: REGION ON THE COMPLEX PLANE
******************************/

var Frame = function(center, reWidth, imHeight) {
    this.center = center;
    this.reWidth = reWidth;
    this.imHeight = imHeight;
    this.reMin = this.center.re - reWidth / 2;
    this.reMax = this.center.re + reWidth / 2;
    this.imMin = this.center.im - imHeight /2;
    this.imMax = this.center.im + imHeight / 2;
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