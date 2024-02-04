/******************************
FRACTALS: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE
******************************/

class Fractal {
    constructor(name, constants) {
        this.name = name;
        this.constants = constants;

        switch (name) {
            case "Mandelbrot":
                this.meta = {
                    type: "escape-time",
                    iterationType: "mandelbrot",
                    juliaEquivalent: "Julia",
                };

                this.iterFunc = function(c, renderSettings) {
                    let z = [0, 0];

                    let iters = renderSettings.fractalSettings.iters;
                    let er = renderSettings.fractalSettings.escapeRadius;

                    let n = 0;
                    while (Complex.abs(z) <= er && n < iters) {
                        let temp = z[0] * z[0] - z[1] * z[1] + c[0];
                        z[1] = 2 * z[0] * z[1] + c[1];
                        z[0] = temp;
        
                        n++;
                    }
                    
                    if (renderSettings.colorSettings.smoothColoring && n != iters) {
                        n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
                    }
                    
                    return n;
                }
                break;

            case "Julia":
                this.meta = {
                    type: "escape-time",
                    iterationType: "julia",
                    reqJuliaConst: true,
                    mandelEquivalent: "Mandelbrot",
                };
        
                this.iterFunc = function(z0, renderSettings) {
                    let z = [z0[0], z0[1]];

                    let iters = renderSettings.fractalSettings.iters;
                    let er = renderSettings.fractalSettings.escapeRadius;

                    let n = 0;
                    while (Complex.abs(z) <= er && n < iters) {
                        let temp = z[0] * z[0] - z[1] * z[1] + this.constants.c[0];
                        z[1] = 2 * z[0] * z[1] + this.constants.c[1];
                        z[0] = temp;
        
                        n++;
                    }
                    
                    if (renderSettings.colorSettings.smoothColoring && n != iters) {
                        n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
                    }
                    
                    return n;
                };
                break;
            
            case "Multibrot":
                this.meta = {
                    type: "escape-time",
                    iterationType: "mandelbrot",
                    reqExponent: true,
                    juliaEquivalent: "MultibrotJulia",
                };

                this.iterFunc = function(c, renderSettings) {
                    let z = [0, 0];

                    let iters = renderSettings.fractalSettings.iters;
                    let er = renderSettings.fractalSettings.escapeRadius;

                    let n = 0;
                    while(Complex.abs(z) <= er && n < iters) {
                        z = Complex.add(
                            Complex.exp(z, this.constants.e), c
                        );
            
                        n++;
                    }
            
                    if(renderSettings.colorSettings.smoothColoring && n != iters) {
                        n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(this.constants.e);
                    }
            
                    return n;
                };
                break;

            case "Multijulia":
                this.meta = {
                    type: "escape-time",
                    iterationType: "julia",
                    reqJuliaConst: true,
                    reqExponent: true,
                    mandelEquivalent: "Multibrot",
                };

                this.iterFunc = function(z0, renderSettings){
                    let z = [z0[0], z0[1]];

                    let iters = renderSettings.fractalSettings.iters;
                    let er = renderSettings.fractalSettings.escapeRadius;

                    let n = 0;
                    while(Complex.abs(z) <= er && n < iters) {
                        z = Complex.add(
                            Complex.exp(z, this.constants.e), this.constants.c
                        );
            
                        n++;
                    }
            
                    if(smoothColoring && n != iterations) {
                        n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(this.constants.e);
                    }
            
                    return n;
                };
        }
    }

    copy() {
        return new Fractal(this.type, this.constants);
    }
}

// Reconstruct serialized object to restore class methods
Fractal.reconstruct = function(fractal) {
    return new Fractal(fractal.type, fractal.constants);
};



/**
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
    Mandelbrot(params, c, iterations, escapeRadius, smoothColoring) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            let temp = z.re * z.re - z.im * z.im + c.re;
            z.im = 2 * z.re * z.im + c.im;
            z.re = temp;

            n++;
        }
        
        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
        }
        
        return n;
    },
    
    Julia(params, _z, iterations, escapeRadius, smoothColoring) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            let temp = z.re * z.re - z.im * z.im + params.c.re;
            z.im = 2 * z.re * z.im + params.c.im;
            z.re = temp;

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
        }

        return n;
    },
    
    Multibrot(params, c, iterations, escapeRadius, smoothColoring) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(z, params.e), c
            );

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(params.e);
        }

        return n;
    },
    
    Multijulia(params, _z, iterations, escapeRadius, smoothColoring) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            z = Complex.add(
                Complex.exp(z, params.e), params.c
            );

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(params.e);
        }

        return n;
    },

    Tricorn(params, c, iterations, escapeRadius, smoothColoring) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            let temp = z.re * z.re - z.im * z.im + c.re;
            z.im = -2 * z.re * z.im + c.im;
            z.re = temp;

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
        }

        return n;
    },

    TricornJulia(params, _z, iterations, escapeRadius, smoothColoring) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            let temp = z.re * z.re - z.im * z.im + params.c.re;
            z.im = -2 * z.re * z.im + params.c.im;
            z.re = temp;

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
        }

        return n;
    },

    Multicorn(params, c, iterations, escapeRadius, smoothColoring) {
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

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(params.e);
        }

        return n;
    },

    MulticornJulia(params, _z, iterations, escapeRadius, smoothColoring) {
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

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(params.e);
        }

        return n;
    },
    
    BurningShip(params, c, iterations, escapeRadius, smoothColoring) {
        let z = Complex(0, 0);
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            let temp = z.re * z.re - z.im * z.im + c.re;
            z.im = Math.abs(2 * z.re * z.im) + c.im;
            z.re = temp;

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
        }

        return n;
    },
    
    BurningShipJulia(params, _z, iterations, escapeRadius, smoothColoring) {
        let z = _z;
        let n = 0;
        while(Complex.abs(z) <= escapeRadius && n < iterations) {
            let temp = z.re * z.re - z.im * z.im + params.c.re;
            z.im = Math.abs(2 * z.re * z.im) + params.c.im;
            z.re = temp;

            n++;
        }

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(2);
        }

        return n;
    },
    
    Multiship(params, c, iterations, escapeRadius, smoothColoring) {
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

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(params.e);
        }

        return n;
    },
    
    MultishipJulia(params, _z, iterations, escapeRadius, smoothColoring) {
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

        if(smoothColoring && n != iterations) {
            n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(params.e);
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
*/