/******************************
FRAME PROTOTYPE: REGION ON THE COMPLEX PLANE
******************************/
var Frame = function(center, reWidth, imHeight) {
	this.center = center;
	this.reWidth = reWidth;
	this.imHeight = imHeight;
	this.reMin = center.re - reWidth / 2;
	this.reMax = center.re + reWidth / 2;
	this.imMin = center.im - imHeight /2;
	this.imMax = center.im + imHeight / 2;

	this.toComplexCoords = function(x, y){
		return {
			re: this.reMin + (this.reWidth * x / WIDTH),
			im: this.imMin + (this.imHeight * y / HEIGHT)
		};
	};
};