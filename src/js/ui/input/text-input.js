class TextInput extends Element {
  constructor(params) {
    super(params);
    this.type = "text";

    if (params.value) {
      this.value = params.value;
      this.element.value = this.value;
    }
    else {
      this.value = this.element.value;
    }
  }

  set(val){
    this.value = val.toString();
    this.element.value = val;
  }

  update() {
    this.value = this.element.value;
  }
}
