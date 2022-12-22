# WIP fractal viewer
Clone and open main.html
* Displays these fractals:
  * Mandelbrot set
  * Julia sets
  * Multibrot sets
  * Multijulia sets
  * Burning Ship fractal
  * Burning Ship Julia sets
  * Multiship fractals (Burning Ships with an exponent other than 2)
  * Multiship Julia sets (Burning Ship Julia sets with an exponent other than 2)
* Adjustable iterations
* Adjustable canvas size
* Zoom by clicking (focus on a point), or by dragging and releasing (focus on a region)
* Center the image with Ctrl + click
* Use Alt + click to view a point's corresponding Juila set or to switch back to the original image

## Coding todo list:
* Add more toolbar options:
  * Set window
  * Set zoom
  * Image quality:
    * Anti-aliasing
    * Smoothed coloring
    * More color options (aka premade palettes / coloring functions)
    * (harder) Custom palettes?
  * (as more toolbar features are added): input sanitization (maybe separate module for tests?)
* Add new fractals:
  * Rational maps
  * Phoenix fractal (feedback from previous iterations)
  * Newtonian fractals?
  * Collatz fractal
  * Custom fractal
    * Equation
    * Iteration style: Mandelbrot or Julia
    * Misc. math functions (abs, log, trig functions)
* Prevent scientific notation for complex coordinates (especially close to im = 0).
* (very useful, but not sure how to implement) Draw bounding box for drag zooming

## Samples:
![mandelbrot set](https://github.com/tang0226/fractal/blob/master/samples/mandelbrot_set.png?raw=true)

![mandelbrot set zoom](https://github.com/tang0226/fractal/blob/master/samples/mandelbrot_10^8_zoom.png?raw=true)

![multibrot set zoom](https://github.com/tang0226/fractal/blob/master/samples/multibrot_4_zoom.png?raw=true)

![burning ship armada](https://github.com/tang0226/fractal/blob/master/samples/burning_ship_armada.png?raw=true)
