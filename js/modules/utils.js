// Color functions
var hsl = function(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

var rgb = function(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}



// Math functions
var scale = function(n, minFrom, maxFrom, minTo, maxTo) {
    return ((n / (maxFrom - minFrom)) * (maxTo - minTo)) + minTo;
};

export {hsl, rgb, scale};
