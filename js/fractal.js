/******************************
FRACTALS: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE:
******************************/

var Fractal = function(type, params) {
    this.type = type;
    this.params = params || {};
};

// Object with iteration functions for each type of fractal
var iterateFractal = {};

iterateFractal.Mandelbrot = function(params, c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.mul(z, z), c);
        n++;
    }
    return n;
};

iterateFractal.Julia = function(params, _z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.mul(z, z), params.c);
        n++;
    }
    return n;
};

iterateFractal.Multibrot = function(params, c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(z, params.e), c);
        n++;
    }
    return n;
};

iterateFractal.Multijulia = function(params, _z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(z, params.e), params.c);
        n++;
    }
    return n;
};

iterateFractal.BurningShip = function(params, c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), 2), c);
        n++;
    }
    return n;
};

iterateFractal.BurningShipJulia = function(params, _z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), 2), params.c);
        n++;
    }
    return n;
};

iterateFractal.Multiship = function(params, c, iterations, escapeRadius) {
    let z = Complex(0, 0);
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), params.e), c);
        n++;
    }
    return n;
};

iterateFractal.MultishipJulia = function(params, _z, iterations, escapeRadius) {
    let z = _z;
    let n = 0;
    while(Complex.abs(z) <= escapeRadius && n < iterations) {
        z = Complex.add(Complex.exp(Complex(Math.abs(z.re), Math.abs(z.im)), params.e), params.c);
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
