/******************************
FRACTALS: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE
******************************/

class Fractal {
  constructor(name, constants) {
    this.name = name;
    this.constants = constants || {};

    switch (name) {
      case "Mandelbrot":
        this.meta = {
          type: "escape-time",
          iterationType: "mandelbrot",
          juliaEquivalent: "Julia",
        };

        this.iterFunc = function(z, c, _e) {
          return [
            z[0] * z[0] - z[1] * z[1] + c[0],
            2 * z[0] * z[1] + c[1]
          ]
        };

        break;


      case "Julia":
        this.meta = {
          type: "escape-time",
          iterationType: "julia",
          reqJuliaConst: true,
          mandelEquivalent: "Mandelbrot",
        };
    
        this.iterFunc = function(z, c, _e) {
          return [
            z[0] * z[0] - z[1] * z[1] + c[0],
            2 * z[0] * z[1] + c[1]
          ];
        };

        break;


      case "Multibrot":
        this.meta = {
          type: "escape-time",
          iterationType: "mandelbrot",
          reqExponent: true,
          juliaEquivalent: "MultibrotJulia",
        };

        this.iterFunc = function(z, c, e) {
          return Complex.add(
            Complex.exp(z, e), c
          );
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

        this.iterFunc = function(z, c, e) {
          return Complex.add(
            Complex.exp(z, e), c
          );
        };
        break

      case "BurningShip":
        this.meta = {
          type: "escape-time",
          iterationType: "mandelbrot",
          juliaEquivalent: "BurningShipJulia",
        };

        this.iterFunc = function(z, c, _e) {
          return [
            z[0] * z[0] - z[1] * z[1] + c[0],
            Math.abs(2 * z[0] * z[1]) + c[1]
          ];
        }
    }
  }

  copy() {
    return new Fractal(this.name, this.constants);
  }
  
  // Reconstruct serialized object to restore class methods
  static reconstruct(fractal) {
    return new Fractal(fractal.name, fractal.constants);
  }

  // Mandelbrot-style iteration (z0 = 0, c = point)
  static iterateMandelbrot(c, iterFunc, iterSettings, e = 2) {
    let z = [0, 0];
    let iters = iterSettings.iters;
    let er = iterSettings.escapeRadius;

    let n = 0;
    while (Complex.abs(z) <= er && n < iters) {
      z = iterFunc(z, c, e);
      n++;
    }

    if (iterSettings.smoothColoring && n != iters) {
      n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(e);
    }

    return n;
  }

  // Julia-style iteration (z0 = point, c = const.)
  static iterateJulia(z0, iterFunc, iterSettings, e = 2) {
    let z = [z0[0], z0[1]];
    let iters = iterSettings.iters;
    let er = iterSettings.escapeRadius;

    let n = 0;
    while (Complex.abs(z) <= er && n < iters) {
      z = iterFunc(z, iterSettings.c, e);
      n++;
    }

    if (iterSettings.smoothColoring && n != iters) {
      n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(e);
    }

    return n;
  }
}


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