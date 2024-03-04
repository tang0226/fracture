class Canvas extends Element {
  constructor(params) {
    // False because we are adding event listeners later
    super(params, false);

    this.width = params.width || this.element.width;
    this.height = params.height || this.element.height;

    this.ctx = this.element.getContext("2d");

    // Mouse interaction?
    if (params.interactive) {
      
      if (params.eventCallbacks) {
        this.eventCallbacks = {};
        for (let event in params.eventCallbacks) {
          this.eventCallbacks[event] = params.eventCallbacks[event].bind(this);
        }
      }
      
      this.mouseX = null;
      this.mouseY = null;
      this.lastMouseX = null;
      this.lastMouseY = null;
      this.mouseDown = false;
      this.startDragX = null;
      this.startDragY = null;
      
      // Bare-bones functionality event listeners are added here
      this.element.addEventListener("mousemove", function(e) {
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
        if (this.eventCallbacks.mouseMove) this.eventCallbacks.mouseMove(e);
      }.bind(this));
  
      this.element.addEventListener("mousedown", function(e) {
        this.mouseDown = true;
        this.startDragX = e.offsetX;
        this.startDragY = e.offsetY;
        if (this.eventCallbacks.mouseDown) this.eventCallbacks.mouseDown(e);
      }.bind(this));

      this.element.addEventListener("mouseup", function(e) {
        this.mouseDown = false;
        this.startDragX = null;
        this.startDragY = null;
        if (this.eventCallbacks.mouseUp) this.eventCallbacks.mouseUp(e);
      }.bind(this));
  
      this.element.addEventListener("mouseout", function(e) {
        this.mouseDown = false;
        this.mouseX = null;
        this.mouseY = null;
        this.lastMouseX = null;
        this.lastMouseY = null;
        this.startDragX = null;
        this.startDragY = null;
        if (this.eventCallbacks.mouseOut) this.eventCallbacks.mouseOut(e);
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
