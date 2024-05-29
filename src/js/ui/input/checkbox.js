class Checkbox extends Element {
  constructor(params) {
    super(params);
    this.type = "checkbox";

    if (params.checked) {
      this.element.checked = params.checked;
    }
  }

  check() {
    this.element.checked = true;
  }

  uncheck() {
    this.element.checked = false;
  }
}
