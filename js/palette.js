var Palette = function(input) {
    lines = input.split(";").map(l => l.trim());
    
    // First line is number of points
    let range = Number(lines[0]);
    if(!Number.isInteger(range)) {
        throw "ValueError: First line must be an integer number of points";
    }
    if(range <= 0) {
        throw "ValueError: First line must be an positive number of points";
    }

    this.points = [];

    for(let i = 1; i < lines.length; i++) {
        let line = lines[i];
        if(!line) {
            continue;
        }

        let parts = line.split(",").map(p => p.trim());
        if(parts.length != 2) {
            throw "SyntaxError: Color line must have two parts, a position and a color";
        }

        // First part is position
        let pos = Number(parts[0]);
        if(Number.isNaN(pos)) {
            throw "ValueError: Color position is not a number";
        }
        if(pos > range || pos < 0) {
            throw "ValueError: Color position is outside of range";
        }

        // Second part is color
        let colorArr = parts[1].split(" ").map(c => Number(c.trim()));
        if(colorArr.length != 3) {
            throw "SyntaxError: Color line must have three space-separated color parameters";
        }
        
        let color = [];
        for(let j = 0; j < 3; j++) {
            let c = colorArr[j];
            if(Number.isNaN(c)) {
                throw "ValueError: Color parameter is not a number";
            }

            if(c < 0 || c > 255) {
                throw "ValueError: Color parameter must be between 0 and 255";
            }
            color.push(c);
        }

        this.points.push({
            pos: pos / range,
            color: color
        })
    }

    this.points.sort(function(a, b) {
        if(a.pos < b.pos) {
            return -1;
        }
        if(a.pos > b.pos) {
            return 1;
        }
        return 0;
    });

    if(this.points[this.points.length - 1].pos != range) {
        this.points.push({
            pos: 1,
            color: this.points[0].color
        });
    }
};

Palette.getColorAt = function(p, pos) {
    let l = p.points.length;

    // Binary search
    let max = Math.ceil(l / 2);
    let min = max - 1;
    while(true) {
        if(pos > p.points[max].pos) {
            min = max;
            max = Math.ceil((max + l) / 2);
        }
        else if(pos < p.points[min].pos) {
            max = min;
            min = Math.floor(min / 2);
        }
        else {
            let frac =
                (pos - p.points[min].pos) /
                (p.points[max].pos - p.points[min].pos);
            let maxPoint = p.points[max];
            return p.points[min].color.map((c, i) =>
                c + (maxPoint.color[i] - c) * frac
            );
        }
    }
};
