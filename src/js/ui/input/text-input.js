class TextInput extends Element {
  constructor(params) {
    super(params);
    this.type = "text";

    if (params.value) {
      this.element.value = params.value;
    }
  }

  set(val){
    this.element.value = val;
  }
}
