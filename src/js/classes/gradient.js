class Gradient {
  constructor(input) {
    this.string = input;
  
    let lines = input.split(";").map(l => l.trim());

    let numColors = lines.length;
    if (!lines[numColors - 1]) {
      lines.pop();
      numColors--;
    }

    this.points = [];
    for (let i = 0; i < numColors; i++) {
      let line = lines[i];
      if (!line) {
        continue;
      }
  
      // Second part is color
      let colorArr = line.split(" ").map(c => Number(c.trim()));

      if (colorArr.length != 3) {
        throw "SyntaxError: Color line must have three space-separated color parameters";
      }
      
      let color = [];
      for (let j = 0; j < 3; j++) {
        let c = colorArr[j];
        if (Number.isNaN(c)) {
          throw "ValueError: Color parameter is not a number";
        }
  
        if (c < 0 || c > 255) {
          throw "ValueError: Color parameter must be between 0 and 255";
        }
        color.push(c);
      }
  
      this.points.push({
        pos: round(i / numColors, 4),
        color: color,
      })
    }
  
    if (this.points[this.points.length - 1].pos != numColors) {
      this.points.push({
        pos: 1,
        //     Useful because of pointers (the ends are linked)
        color: this.points[0].color
      });
    }

    this.updateString();
  }
  

  updatePositions() {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].pos = round(i / (this.points.length - 1), 4);
    }
  }

  getColorAt(pos) {
    let l = this.points.length;
  
    // Binary search
    let max = l - 1;
    let min = 0;
    while (true) {
      let avg = (min + max) / 2;
      if (pos >= this.points[Math.floor(avg)].pos) {
        min = Math.floor(avg);
      }
      else if (pos <= this.points[Math.ceil(avg)].pos) {
        max = Math.ceil(avg);
      }
      if (max - min == 1) {
        return this.points[min].color.map((c, i) =>
          c + (this.points[max].color[i] - c) * (
            (pos - this.points[min].pos) /
            (this.points[max].pos - this.points[min].pos)
          )
        );
      }
    }
  }

  getPrettifiedString() {
    let str = "";
    for (let i = 0; i < this.points.length - 1; i++) {
      let col = this.points[i].color;
      str += `${col[0]} ${col[1]} ${col[2]};`;
      if (i != this.points.length - 2) str += "\n";
    }
    return str;
  }

  updateString() {
    this.string = this.getPrettifiedString();
  }

  insertColorAt(color, i) {
    this.points = [
      ...this.points.slice(0, i),
      {pos: 0, color: color},
      ...this.points.slice(i)
    ];
    if (i == 0) {
      // Link first and last
      this.points[this.points.length - 1].color = this.points[0].color;
    }
    if (i == this.points.length - 1) {
      // Link first and last
      this.points[0].color = this.points[this.points.length - 1].color;
    }
    this.updatePositions();
    this.updateString();
  }

  deleteColorAt(i) {
    this.points = [
      ...this.points.slice(0, i),
      ...this.points.slice(i + 1)
    ];
    if (i == 0) {
      // Link first and last
      this.points[this.points.length - 1].color = this.points[0].color;
    }
    if (i == this.points.length) {
      // Link first and last
      this.points[0].color = this.points[this.points.length - 1].color;
    }

    this.updatePositions();
    this.updateString();
  }

  copy() {
    return new Gradient(this.string);
  }
  
  // Reconstruct serialized object to restore class methods
  static reconstruct(gradient) {
    return new Gradient(gradient.string);
  }
}
