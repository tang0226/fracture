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
  

  getColorAt(pos) {
    let l = this.points.length;
  
    // Binary search
    let max = l - 1;
    let min = 0;
    while (true) {
      if (pos >= this.points[Math.floor((min + max) / 2)].pos) {
        min = Math.floor((min + max) / 2);
      }
      else if (pos <= this.points[Math.ceil((min + max) / 2)].pos) {
        max = Math.ceil((min + max) / 2);
      }
      if (max - min == 1) {
        let frac =
          (pos - this.points[min].pos) /
          (this.points[max].pos - this.points[min].pos);
        let maxPoint = this.points[max];
        return this.points[min].color.map((c, i) =>
          c + (maxPoint.color[i] - c) * frac
        );
      }
    }
  }

  getPrettifiedString() {
    let str = "";
    for (let i = 0; i < this.points.length - 1; i++) {
      let col = this.points[i].color;
      str += `${col[0]} ${col[1]} ${col[2]};`;
      if (i != this.points.length - 1) str += "\n";
    }
    return str;
  }

  updateString() {
    this.string = this.getPrettifiedString();
  }

  copy() {
    return new Gradient(this.string);
  }
  
  // Reconstruct serialized object to restore class methods
  static reconstruct(gradient) {
    return new Gradient(gradient.string);
  }
}
