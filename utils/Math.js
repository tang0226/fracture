var random = Math.random;
var randInt = function(lower, upper) {
	return floor(random() * (upper - lower + 1)) + lower;
};
var randBetween = function(lower, upper) {
	return (random() * (upper - lower)) + lower
};

var round = function(n, p = 0) {
	let power = 10 ** p;
	return Math.round(n * power) / power;
}
var scale = function(n, minFrom, maxFrom, minTo, maxTo) {
	return ((n / (maxFrom - minFrom)) * (maxTo - minTo)) + minTo;
};
var floor = Math.floor;

var max = Math.max;
var min = Math.min;

// Trigonometry / Circle stuff
var hypot = Math.hypot;
const PI = Math.PI;
const TAU = 2 * Math.PI;
var toDegrees = function(r) {
	return r * 180 / PI;
};
var toRadians = function(d) {
	return d * PI / 180;
};
var abs = Math.abs;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var asin = Math.asin;
var acos = Math.acos;
var atan = Math.atan;
var atan2 = Math.atan2;