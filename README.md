# WIP fractal viewer
Clone and open main.html
* Displays these fractals (Change/create in main.js):
  * Mandelbrot set
  * Julia sets
  * Multibrot sets
  * Multijulia sets
  * Burning Ship fractal
  * Burning Ship Julia sets
  * Multiship fractals (Burning Ships with an exponent other than 2)
  * Multiship Julia sets (Burning Ship Julia sets with an exponent other than 2)
* Adjustable iterations
* Zoom by clicking (focus on a point), or by dragging and releasing (focus on a region)

## Coding todo list:
* Add more toolbar options:
  * All fractal parameters should be able to be modified in the toolbar:
    * No code modification should be required
    * Dropdown to select fractal type (like usefuljs.net)
    * Set window
    * Set zoom
    * Set canvas size
  * Image quality:
    * Anti-aliasing
    * Smoothed coloring
    * More color options (aka premade palettes / coloring functions)
    * (harder) Custom palettes?
  * (as more toolbar features are added): input sanitization (maybe separate module for tests?)
* Add new fractals:
  * Rational maps
  * Phoenix fractal
  * Newtonian fractals if you can figure out the math :P
  * Collatz fractal!
  * Build-your-own fractal
    * Equation
    * Misc. math functions (abs, log, trigonometric)
* Prevent scientific notation for complex coordinates (especially close to im = 0).
* Add informative comments to code
* (very useful, but not sure how to implement) Draw bounding box for drag zooming

## Samples:
![mandelbrot set](https://github.com/tang0226/fractal/blob/master/samples/mandelbrot_set.png?raw=true)

![mandelbrot set zoom](https://github.com/tang0226/fractal/blob/master/samples/mandelbrot_10^8_zoom.png?raw=true)

![multibrot set zoom](https://github.com/tang0226/fractal/blob/master/samples/multibrot_4_zoom.png?raw=true)

![burning ship armada](https://github.com/tang0226/fractal/blob/master/samples/burning_ship_armada.png?raw=true)
