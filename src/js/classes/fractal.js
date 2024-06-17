/******************************
FRACTALS: THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE
******************************/

class Fractal {
  //          FractalType instance
  constructor(type, params) {
    this.type = type;
    this.params = params || {};
    this.iterFunc = type.iterFunc;
  }

  copy() {
    return new Fractal(this.type, {...this.params});
  }

  static reconstruct(fractal, fractalTypes) {
    return new Fractal(fractalTypes[fractal.type.id], {...fractal.params});
  }


  // Mandelbrot-style iteration wrapper (z0 = 0, c = point)
  static iterateMandelbrot(c, iterFunc, iterSettings, params) {
    let z = [0, 0];
    let iters = iterSettings.iters;
    let er = iterSettings.escapeRadius;

    let n = 0;
    while (Complex.abs(z) <= er && n < iters) {
      z = iterFunc(z, c, params);
      n++;
    }

    if (iterSettings.smoothColoring && n != iters) {
      n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(iterSettings.smoothColoringExp);
    }

    return n;
  }

  // Julia-style iteration wrapper (z0 = point, c = const.)
  static iterateJulia(z0, iterFunc, iterSettings, params) {
    let z = [z0[0], z0[1]];
    let iters = iterSettings.iters;
    let er = iterSettings.escapeRadius;

    let n = 0;
    while (Complex.abs(z) <= er && n < iters) {
      z = iterFunc(z, params);
      n++;
    }

    if (iterSettings.smoothColoring && n != iters) {
      n += 1 - Math.log(Math.log(Complex.abs(z))) / Math.log(iterSettings.smoothColoringExp);
    }

    return n;
  }
}


/** 
class Fractal {
  constructor(id, constants) {
    this.id = id;
    this.constants = constants || {};

    switch (id) {
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
          ];
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
        break;

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
        };
        break;
      
      case "BurningShipJulia":
        this.meta = {
          type: "escape-time",
          iterationType: "julia",
          reqJuliaConst: true,
          mandelEquivalent: "BurningShip",
        };

        this.iterFunc = function(z, c, _e) {
          return [
            z[0] * z[0] - z[1] * z[1] + c[0],
            Math.abs(2 * z[0] * z[1]) + c[1]
          ];
        };
        break;
      
      case "Multiship":
        this.meta = {
          type: "escape-time",
          iterationType: "mandelbrot",
          reqExponent: true,
          juliaEquivalent: "MultishipJulia",
        };

        this.iterFunc = function(z, c, e) {
          return Complex.add(
            Complex.exp([Math.abs(z[0]), Math.abs(z[1])], e), c
          );
        };
        break;

      case "MultishipJulia":
        this.meta = {
          type: "escape-time",
          iterationType: "julia",
          reqJuliaConst: true,
          reqExponent: true,
          mandelEquivalent: "Multiship",
        };

        this.iterFunc = function(z, c, e) {
          return Complex.add(
            Complex.exp([Math.abs(z[0]), Math.abs(z[1])], e), c
          );
        };
        break;

      case "Tricorn":
        this.meta = {
          type: "escape-time",
          iterationType: "mandelbrot",
          mandelEquivalent: "TricornJulia",
        };

        this.iterFunc = function(z, c, e) {
          return [
            z[0] * z[0] - z[1] * z[1] + c[0],
            -2 * z[0] * z[1] + c[1]
          ];
        };
    }
  }

  copy() {
    return new Fractal(this.id, this.constants);
  }
  
  // Reconstruct serialized object to restore class methods
  static reconstruct(fractal) {
    return new Fractal(fractal.id, fractal.constants);
  }
}
**/