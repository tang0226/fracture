/******************************
COMPLEX NUMBERS
******************************/ 

// No prototype, too tedious and unnecessary
// to type "new Complex()" each time
function Complex(re, im) {
  return [re, im];
};

// Object -> string "a+bi"
Complex.toString = function(c) {
  let string = c[0].toString();
  if(c[1] >= 0) {
    string += "+";
  }
  return string + c[1].toString() + "i";
};

// String "a+bi" -> object
Complex.parseString = function(s) {
  let match = s.match(/^(-?\d+(\.\d+)?)((\+|-)(\d+(\.\d+)?))i$/);
  if(match) {
    return [Number(match[1]), Number(match[3])];
  }
};

// Operators
Complex.isEqual = function(c1, c2) {
  return c1[0] == c2[0] && c1[1] == c2[1];
};

Complex.add = function(c1, c2) {
  return Complex(c1[0] + c2[0], c1[1] + c2[1]);
};

Complex.sub = function(c1, c2) {
  return Complex(c1[0] - c2[0], c1[1] - c2[1]);
};

Complex.mul = function(c1, c2) {
  return Complex(
    c1[0] * c2[0] - c1[1] * c2[1],
    c1[0] * c2[1] + c1[1] * c2[0]
  );
};

Complex.div = function(c1, c2) {
  return Complex(
    (c1[0] * c2[0] + c1[1] * c2[1]) / (c2[0] * c2[0] + c2[1] * c2[1]),
    (c1[1] * c2[0] - c1[0] * c2[1]) / (c2[0] * c2[0] + c2[1] * c2[1])
  );
};

Complex.sq = function(c) {
  return Complex(
    c[0] ** 2 - c[1] ** 2,
    2 * c[0] * c[1]
  );
};

// Only positive integer exponents, for now
Complex.exp = function(c, e) {
  let r = c;
  let currE = 1;
  while (currE < e) {
    r = Complex.mul(r, c);
    currE++;
  }
  return r;
};

// The absolute value of a complex number is its
// Euclidean distance from the origin
Complex.abs = function(c) {
  return Math.sqrt(c[0] ** 2 + c[1] ** 2);
};

// The complex conjugate a+bi is a-bi
Complex.conj = function(c) {
  return Complex(c[0], -c[1]);
}
