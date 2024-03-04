class TextElement extends Element {
  constructor(params) {
    super(params);

    if (params.innerText) {
      this.innerText = params.innerText;
      this.element.innerText = this.innerText;
    }
  }

  set(text) {
    this.innerText = text;
    this.element.innerText = text;
  }
}
