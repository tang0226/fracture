class ProgressBar extends Element {
  constructor(params) {
    super(params);

    if (params.value) {
      this.value = params.value;
      this.element.value = this.value;
    }
    else {
      this.value = this.element.value;
    }
  }

  set(val){
    this.value = val;
    this.element.value = val;
  }
}
