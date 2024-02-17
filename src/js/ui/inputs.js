/******************************
INPUT CLASSES: Objects representing HTML inputs
******************************/ 

class TextInput extends Element {
  constructor(params) {
    super(params);
    this.type = "text";

    if (params.val) {
      this.val = params.val;
      this.element.value = this.val;
    }
    else {
      this.val = this.element.value;
    }
  }

  set(val){
    this.val = val;
    this.element.value = val;
  }

  sync() {
    this.val = this.element.value;
  }

  update() {
    this.element.value = this.val;
  }
}

class Button extends Element {
  constructor(params) {
    super(params);
    this.type = "button";
  }
}

