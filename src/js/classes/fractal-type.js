/******************************
FRACTALS TYPES: CATEGORIES OF THEORETICAL MATHEMATICAL SETS IN THE COMPLEX PLANE
STATIC OBJECTS: SPECIFIC FRACTAL PARAMETERS ARE PASSED TO THE Fractal PROTOTYPE
(see fractal.js)
******************************/
class FractalType {
  constructor(obj) {
    this.id = obj.id;
    this.meta = obj.meta;
    this.iterFunc = obj.iterFunc;
  }
}