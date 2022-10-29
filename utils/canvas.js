/*************************
Canvas DOM object is "canvas"
Canvas context is "ctx"
*************************/

var load = function(files, func, i = 0) {
	var script = document.createElement("script");
	script.onload = function() {
		if(files[i + 1]) {
			load(files, func, i + 1);
		}
		else {
			func();
		}
	};
	script.src = files[i];
	document.body.appendChild(script);
};

var addEvent = function(action, reaction) {
	canvas["on" + action] = reaction;
};

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var setCanvasDim = function(w, h) {
	canvas.width = w;
	WIDTH = w;
	canvas.height = h;
	HEIGHT = h;
};

var STROKE = true;

var COLOR_MODE = "RGB";

var FRAME_DELAY = 1000 / 60;
var frameRate = function(f) {
	FRAME_DELAY = 1000 / f;
	return FRAME_DELAY;
};

// Style (stroke, fill, shadow, gradient)
{
	var noStroke = function() {
		STROKE = false;
	};
	var colorMode = function(m) {
		COLOR_MODE = m;
	};
	let getColorString = function(p1, p2, p3, a) {
		let useAlpha = a != undefined;
		switch(COLOR_MODE) {
			case "RGB":
				if(p2 == undefined) {
					return `rgb${useAlpha ? "a" : ""}(${p1}, ${p1}, ${p1}${useAlpha ? ", " + a : ""})`;
				} else {
					return `rgb${useAlpha ? "a" : ""}(${p1}, ${p2}, ${p3}${useAlpha ? ", " + a : ""})`;
				}
			break;
			case "HSL":
				return `hsl${useAlpha ? "a" : ""}(${p1}, ${p2}%, ${p3}%${useAlpha ? ", " + a : ""})`;
			break;
			case "HEX":
			case "NAME":
			default:
				return p1;
		}
	};
	var color = function(p1, p2, p3, a) {
		let col = {
			type: COLOR_MODE,
			color: getColorString(p1, p2, p3, a)
		};
		switch(COLOR_MODE) {
			case "RGB":
				col.r = p1;
				col.g = p2;
				col.b = p3;
				col.a = a;
				return col;
			break;
			case "HSL":
				col.h = p1;
				col.s = p2;
				col.l = p3;
				col.a = a;
				return col;
			break;
			case "HEX":
				let l = p1.length;
				if(l >= 7) {
					col.r = p1.substring(1, 3);
					col.g = p1.substring(3, 5);
					col.b = p1.substring(5, 7);
					if(l == 9) {
						col.a = p1.substring(7, 9);
					}
				} else {
					col.r = p1[1];
					col.g = p1[2];
					col.b = p1[3];
					if(l == 5) {
						col.a = p1[4];
					}
				}
				return col;
			default:
				return col;
		}
	};
	var fill = function(p1, p2, p3, a) {
		if(typeof p1 == "object") {
			ctx.fillStyle = p1.color;
		} else {
			ctx.fillStyle =  getColorString(p1, p2, p3, a);
		}
	};
	var stroke = function(p1, p2, p3, a) {
		STROKE = true;
		if(typeof p1 == "object") {
			ctx.strokeStyle = p1.color;
		} else {
			ctx.strokeStyle =  getColorString(p1, p2, p3, a);
		}
	};
	var background = function(p1, p2, p3, a) {
		if(typeof p1 == "object") {
			ctx.fillStyle = p1.color;
		} else {
			ctx.fillStyle =  getColorString(p1, p2, p3, a);
		}
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
	};
	var shadowColor = function(p1, p2, p3, a) {
		if(typeof p1 == "object") {
			ctx.shadowColor = p1.color;
		} else {
			ctx.shadowColor =  getColorString(p1, p2, p3, a);
		}
	};
	var shadowBlur = function(b) {
		ctx.shadowBlur = b;
	};
	var shadowOffset = function(x, y) {
		ctx.shadowOffsetX = x;
		ctx.shadowOffsetY = y;
	};
	var createLinearGradient = function(x0, y0, x1, y1) {
		return ctx.createLinearGradient(x0, y0, x1, y1);
	};
	var createRadialGradient = function(x0, y0, r0, x1, y1, r1) {
		return ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
	};
};

// Line Styles
{
	var lineCap = function(cap) {
		ctx.lineCap = cap;
	};
	var lineJoin = function(j) {
		ctx.lineJoin = j;
	};
	var strokeWeight = function(w) {
		ctx.lineWidth = w;
	};
};

// Paths
{
	var fillPath = function() {
		ctx.fill();
	};
	var strokePath = function() {
		ctx.stroke();
	};
	var drawPath = function() {
		ctx.fill();
		if(STROKE) {
			ctx.stroke();
		}
	}
	var beginPath = function() {
		ctx.beginPath();
	};
	var moveTo = function(x, y) {
		ctx.moveTo(x, y);
	};
	var closePath = function() {
		ctx.closePath();
	};
	var lineTo = function(x, y) {
		ctx.lineTo(x, y);
	};
	var clip = function() {
		ctx.clip();
	};
	var quadraticCurveTo = function(cpx, cpy, x, y) {
		ctx.quadraticCurveTo(cpx, cpy, x, y);
	};
	var bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
		ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};
}

// Text
{
	var font = function(f) {
		let data = ctx.font.split(" ");
		ctx.font = data[0] + " " + f;
	};
	var fontSize = function(s) {
		let data = ctx.font.split(" ");
		ctx.font = s.toString() + "px " + data[1];
	};
	var setFont = function(f) {
		ctx.font = f;
	};
	var textAlign = function(a) {
		ctx.textAlign = a;
	};
	var textBaseline = function(b) {
		ctx.textBaseline = b;
	};
	var text = function(text, x, y, maxWidth = undefined) {
		ctx.fillText(text, x, y, maxWidth);
	};
	var strokeText = function(text, x, y, maxWidth = undefined) {
		ctx.strokeText(text, x, y, maxWidth);
	};
	var measureText = function(t) {
		return ctx.measureText(t).width;
	};
};

// Shapes
{
	var line = function(x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	};

	var triangle = function(x1, y1, x2, y2, x3, y3) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x3, y3);
		ctx.closePath();
		ctx.fill();
		if(STROKE) {
			ctx.stroke();
		}
	};

	var quad = function(x1, y1, x2, y2, x3, y3, x4, y4) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x3, y3);
		ctx.lineTo(x4, y4);
		ctx.closePath();
		ctx.fill();
		if(STROKE) {
			ctx.stroke();
		}
	}

	var rect = function(x, y, w, h) {
		ctx.beginPath()
		ctx.fillRect(x, y, w, h);
		
		if(STROKE) {
			ctx.rect(x, y, w, h);
			ctx.stroke();
		}
	};

	var ellipse = function(x, y, rx, ry) {
		ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
		ctx.fill();
		if(STROKE) {
			ctx.stroke();
		}
	};

	var circle = function(x, y, r) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, TAU);
		ctx.fill();
		if(STROKE) {
			ctx.stroke();
		}
	}
};

// Image
{
	var image = function(img, x, y, width, height) {
		if(!(width && height)) {
			ctx.drawImage(img, x, y);
		}
		else {
			ctx.drawImage(img, x, y, width, height);
		}
	};
};

// Pixel manipulation
{
	var getImageData = function(x, y, width, height) {
		return ctx.getImageData(x, y, width, height);
	};
	
	var putImageData = function(x, y, width, height) {
		if(!(width && height)) {
			ctx.putImageData(x, y, width, height);
		}
		else {
			ctx.putImageData(x, y);
		}
	};
};

// Transformations
{
	var scale = function(w, h) {
		ctx.scale(w, h);
	};
	var rotate = function(a) {
		ctx.rotate(a);
	};
	var translate = function(x, y) {
		ctx.translate(x, y);
	};
	var resetTransform = function() {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	};
};