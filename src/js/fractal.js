/******************************
FRACTALS: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE:
******************************/

function Fractal(type, params) {
    this.type = type;
    for(let prop in Fractal.data[type]) {
        this[prop] = Fractal.data[type][prop];
    }
    this.params = params || {};
};

Fractal.data = {
    Mandelbrot: {
        requiresJuliaConstant: false,
        requiresExponent: false,
        juliaEquivalent: "Julia"
    },
    Julia: {
        requiresJuliaConstant: true,
        requiresExponent: false
    },
    Multibrot: {
        requiresJuliaConstant: false,
        requiresExponent: true,
        juliaEquivalent: "Multijulia"
    },
    Multijulia: {
        requiresJuliaConstant: true,
        requiresExponent: true
    },
    Tricorn: {
        requiresJuliaConstant: false,
        requiresExponent: false,
        juliaEquivalent: "TricornJulia"
    },
    TricornJulia: {
        requiresJuliaConstant: true,
        requiresExponent: false
    },
    Multicorn: {
        requiresJuliaConstant: false,
        requiresExponent: true,
        juliaEquivalent: "MulticornJulia"
    },
    MulticornJulia: {
        requiresJuliaConstant: true,
        requiresExponent: true
    },
    BurningShip: {
        requiresJuliaConstant: false,
        requiresExponent: false,
        juliaEquivalent: "BurningShipJulia"
    },
    BurningShipJulia: {
        requiresJuliaConstant: true,
        requiresExponent: false,
    },
    Multiship: {
        requiresJuliaConstant: false,
        requiresExponent: true,
        juliaEquivalent: "MultishipJulia"
    },
    MultishipJulia: {
        requiresJuliaConstant: true,
        requiresExponent: true
    }
};

Fractal.iterate = {
    Mandelbrot(params, c, iterations, escapeRadius) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.mul(z, z), c
            );
            n++;
        }
        return n;
    },
    
    Julia(params, _z, iterations, escapeRadius) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.mul(z, z), params.c
            );
            n++;
        }
        return n;
    },
    
    Multibrot(params, c, iterations, escapeRadius) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(z, params.e), c
            );
            n++;
        }
        return n;
    },
    
    Multijulia(params, _z, iterations, escapeRadius) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(z, params.e), params.c
            );
            n++;
        }
        return n;
    },

    Tricorn(params, c, iterations, escapeRadius) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex.conj(z), 2
                ), c
            );
            n++;
        }
        return n;
    },

    TricornJulia(params, _z, iterations, escapeRadius) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex.conj(z), 2
                ),
                params.c
            );
            n++;
        }
        return n;
    },

    Multicorn(params, c, iterations, escapeRadius) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex.conj(z), params.e
                ), c
            );
            n++;
        }
        return n;
    },

    MulticornJulia(params, _z, iterations, escapeRadius) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex.conj(z), params.e
                ),
                params.c
            );
            n++;
        }
        return n;
    },
    
    BurningShip(params, c, iterations, escapeRadius) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex(Math.abs(z.re), Math.abs(z.im)), 2
                ), c
            );
            n++;
        }
        return n;
    },
    
    BurningShipJulia(params, _z, iterations, escapeRadius) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex(Math.abs(z.re), Math.abs(z.im)), 2
                ), params.c
            );
            n++;
        }
        return n;
    },
    
    Multiship(params, c, iterations, escapeRadius) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex(Math.abs(z.re), Math.abs(z.im)), params.e
                ), c
            );
            n++;
        }
        return n;
    },
    
    MultishipJulia(params, _z, iterations, escapeRadius) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(
                    Complex(Math.abs(z.re), Math.abs(z.im)), params.e
                ), params.c
            );
            n++;
        }
        return n;
    }
};


// Utility functions
Fractal.requiresExponent = function(fractalType) {
    return this.data[fractalType].requiresExponent;
};

Fractal.requiresJuliaConstant = function(fractalType) {
    return this.data[fractalType].requiresJuliaConstant;
};

Fractal.juliaEquivalent = function(fractalType) {
    return this.data[fractalType].juliaEquivalent;
};
