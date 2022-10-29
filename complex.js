var Complex = function(re, im) {
	this.re = re;
	this.im = im;
	
	this.add = function(c) {
		return new Complex(this.re + c.re, this.im + c.im);
	};
	this.sub = function(c) {
		return new Complex(this.re - c.re, this.im - c.im);
	};
	this.mul = function(c) {
		return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re);
	};
	this.div = function(c) {
		return new Complex(
			(this.re * c.re + this.im * c.im) / (c.re * c.re + c.im * c.im),
			(this.im * c.re - this.re * c.im) / (c.re * c.re + c.im * c.im)
		);
	};
}
Complex.prototype.add = function(c) {
	return new Complex(this.re + c.re, this.im + c.im);
};
Complex.prototype.sub = function(c) {
	return new Complex(this.re - c.re, this.im - c.im);
};
Complex.prototype.mul = function(c) {
	return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re);
};
Complex.prototype.div = function(c) {
	return new Complex(
		(this.re * c.re + this.im * c.im) / (c.re ** 2 + c.im ** 2),
		(this.im * c.re - this.re * c.im) / (c.re ** 2 + c.im ** 2)
	);
};
Complex.prototype.exp = function(e) {
	if(e == 1){
		return this;
	}
	return this.mul(this.exp(e - 1));
};