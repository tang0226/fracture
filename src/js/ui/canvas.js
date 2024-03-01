class Canvas extends Element {
  constructor(params) {
    super(params);

    this.width = params.width || this.element.width;
    this.height = params.height || this.element.height;

    this.ctx = this.element.getContext("2d");


    // Mouse interaction?
    if (params.interactive) {
      this.mouseX = null;
      this.mouseY = null;
      this.lastMouseX = null;
      this.lastMouseY = null;
      this.mouseDown = false;
      this.startDragX = null;
      this.startDragY = null;
      
      
      this.element.addEventListener("mousemove", function(e) {
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
      }.bind(this));
  
      this.element.addEventListener("mousedown", function(e) {
        this.mouseDown = true;
        this.startDragX = e.offsetX;
        this.startDragY = e.offsetY;
      }.bind(this));
  
      this.element.addEventListener("mouseout", function() {
        this.mouseDown = false;
        this.mouseX = null;
        this.mouseY = null;
        this.lastMouseX = null;
        this.lastMouseY = null;
        this.startDragX = null;
        this.startDragY = null;
      }.bind(this))
    }
  }

  setDim(width, height) {
    this.element.style.width = width + "px";
    this.element.style.height = height + "px";
    this.element.width = width;
    this.element.height = height;
    this.width = width;
    this.height = height;
  }
}
