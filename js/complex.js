/******************************
COMPLEX NUMBERS
******************************/ 

var Complex = function(re, im) {
    return {
        re: re,
        im: im
    };
};

Complex.toString = function(c) {
    let string = c.re.toString();
    if(c.im >= 0) {
        string += "+";
    }
    return string + c.im.toString() + "i";
};

Complex.parseString = function(s) {
    let match = s.match(/(-?\d+(\.\d+)?)((\+|-)(\d+(\.\d+)?))i/);
    if(match) {
        return Complex(Number(match[1]), Number(match[3]));
    }
};

Complex.equals = function(c1, c2) {
    return c1.re == c2.re && c1.im == c2.im;
};

Complex.add = function(c1, c2) {
    return Complex(c1.re + c2.re, c1.im + c2.im);
};

Complex.sub = function(c1, c2) {
    return Complex(c1.re - c2.re, c1.im - c2.im);
};

Complex.mul = function(c1, c2) {
    return Complex(
        c1.re * c2.re - c1.im * c2.im,
        c1.re * c2.im + c1.im * c2.re
    );
};

Complex.div = function(c1, c2) {
    return Complex(
        (c1.re * c2.re + c1.im * c2.im) / (c2.re * c2.re + c2.im * c2.im),
        (c1.im * c2.re - c1.re * c2.im) / (c2.re * c2.re + c2.im * c2.im)
    );
};

Complex.sq = function(c) {
    return Complex(
        c.re ** 2 - c.im ** 2,
        2 * c.re * c.im
    );
};

Complex.exp = function(c, e) {
    let r = c;
    let currE = 1;
    while(currE < e) {
        r = Complex.mul(r, c);
        currE++;
    }
    return r;
};

Complex.abs = function(c) {
    return (c.re ** 2 + c.im ** 2) ** 0.5;
};
