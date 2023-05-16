# Fracture: fractal viewer built with HTML canvas
Main page is located at main.html ([view online](https://tang0226.github.io/fracture/main)).
* Displays these fractals:
  * Mandelbrot set and Julia sets
  * Multibrot sets and Julia sets
  * Burning Ship fractal and Julia sets
  * Multiship fractals and Julia sets (Burning Ships and Julia sets with an exponent other than 2)
  * Tricorn fractal and Julia sets
  * Mulicorn fractals and Julia sets
* Adjustable parameters:
  * Iterations
  * Canvas size
  * Escape radius
  * Julia constants and exponents
* Zooming:
  * Clicking (to focus on a point)
  * Drag and release (to focus on a region)
    * Press Esc to cancel a drag
* Center the image with Ctrl + click
* Use Alt + click to view a point's corresponding Juila set or to switch back to the original image
* Downloadable images
* NEW: Custom palettes 
* More features and fractals coming!

## Code / features todo list:
* Add more toolbar options:
  * Image quality:
    * Anti-aliasing
    * Smooth coloring
    * More color options (aka premade palettes / coloring functions)
* Add new fractals:
  * Rational maps
  * Phoenix fractal (feedback from previous iterations)
  * Newtonian fractals?
  * Collatz fractal
  * Custom fractal
    * Equation (+ parser)
    * Iteration style: Mandelbrot or Julia
    * Misc. math functions (abs, log, trig functions)
    * Feedback from previous iterations
* Prevent scientific notation for complex coordinates (especially close to im = 0)
* Add help section/popup
* Dynamically built functions to improve rendering time?
  * This can also facilitate new options such as:
    * Hybrid fractals
    * More flexible palettes
* "Touch up" function: only recalculate image if necessary (i.e. something about the fractal changed); This will allow for faster palette manipulation to fine-tune a render.
* Friendly palette UI (instead of text)
* Streamline toolbar structure
* Shorten variable and function names

## Samples:
![mandelbrot set](https://github.com/tang0226/fractal/blob/master/samples/mandelbrot_set.png?raw=true)

![julia set](https://github.com/tang0226/fractal/blob/master/samples/julia_set_1.png?raw=true)

![burning ship armada](https://github.com/tang0226/fractal/blob/master/samples/burning_ship_armada.png?raw=true)

![multibrot set](https://github.com/tang0226/fractal/blob/master/samples/multibrot_3.png?raw=true)

![multibrot zoom](https://github.com/tang0226/fractal/blob/master/samples/multibrot_large.png?raw=true)
