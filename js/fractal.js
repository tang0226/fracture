/******************************
FRACTAL PROTOTYPES: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE:
******************************/

var Mandelbrot = function() {};

Mandelbrot.prototype.iterate = function(c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.mul(z, z), c);
        n++;
    }
    return n;
};



var Julia = function(c) {
    this.c = c;
};

Julia.prototype.iterate = function(_z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.mul(z, z), this.c);
        n++;
    }
    return n;
};



var Multibrot = function(e) {
    this.e = e;
};

Multibrot.prototype.iterate = function(c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(z, this.e), c);
        n++;
    }
    return n;
};



var Multijulia = function(e, c) {
    this.e = e;
    this.c = c;
}; 

Multijulia.prototype.iterate = function(_z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(z, this.e), this.c);
        n++;
    }
    return n;
};



var BurningShip = function() {};

BurningShip.prototype.iterate = function(c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), 2), c);
        n++;
    }
    return n;
};



var BurningShipJulia = function(c) {
    this.c = c;
};

BurningShipJulia.prototype.iterate = function(_z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), 2), this.c);
        n++;
    }
    return n;
};



var Multiship = function(e) {
    this.e = e;
};
Multiship.prototype.iterate = function(c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), this.e), c);
        n++;
    }
    return n;
};



var MultishipJulia = function(e, c) {
    this.e = e;
    this.c = c;
};

MultishipJulia.prototype.iterate = function(_z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), this.e), this.c);
        n++;
    }
    return n;
};



// Utility functions
var requiresExponent = function(fractalType) {
    return [
        "Multibrot",
        "Multijulia",
        "Multiship",
        "MultishipJulia"
    ].includes(fractalType);
};

var requiresJuliaConstant = function(fractalType) {
    return [
        "Julia",
        "Multijulia",
        "BurningShipJulia",
        "MultishipJulia"
    ].includes(fractalType);
};

var getJuliaEquivalent = function(fractalType) {
    return {
        "Mandelbrot": "Julia",
        "Multibrot": "Multijulia",
        "BurningShip": "BurningShipJulia",
        "Multiship": "MultishipJulia"
    }[fractalType];
};
