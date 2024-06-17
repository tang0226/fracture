const FRACTAL_TYPES = {
  mandelbrot: new FractalType({
    id: "mandelbrot",
    meta: {
      iterationType: "mandelbrot",
      juilaEquivalent: "julia",
    },
    iterFunc: function(z, c, _params) {
      return [
        z[0] * z[0] - z[1] * z[1] + c[0],
        2 * z[0] * z[1] + c[1]
      ];
    },
  }),

  julia: new FractalType({
    id: "julia",
    meta: {
      iterationType: "julia",
      reqJuliaConst: true,
      mandelEquivalent: "mandelbrot",
    },
    iterFunc: function(z, params) {
      return [
        z[0] * z[0] - z[1] * z[1] + params.c[0],
        2 * z[0] * z[1] + params.c[1]
      ];
    },
  }),

  multibrot: new FractalType({
    id: "multibrot",
    meta: {
      iterationType: "mandelbrot",
      reqExponent: true,
      juliaEquivalent: "multijulia",
    },
    iterFunc: function(z, c, params) {
      return Complex.add(
        Complex.exp(z, params.e),
        c,
      )
    }
  }),
};
