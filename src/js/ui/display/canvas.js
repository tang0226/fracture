class Canvas extends Element {
  constructor(params) {
    // False because we are adding event listeners later (see element.js)
    super(params, false, false);

    this.width = params.width || this.element.width;
    this.height = params.height || this.element.height;

    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    this.element.width = this.width;
    this.element.height = this.height;

    this.ctx = this.element.getContext("2d");

    this.eventCallbacks = {};

    // Mouse interaction?
    if (params.interactive) {
      
      if (params.eventCallbacks) {
        for (let event in params.eventCallbacks) {
          this.eventCallbacks[event] = params.eventCallbacks[event].bind(this);
        }
      }
      
      this.state.mouseX = null;
      this.state.mouseY = null;
      this.state.lastMouseX = null;
      this.state.lastMouseY = null;
      this.state.mouseDown = false;
      this.state.startDragX = null;
      this.state.startDragY = null;
      
      // Bare-bones functionality event listeners are added here
      this.element.addEventListener("mousemove", function(e) {
        this.state.lastMouseX = this.state.mouseX;
        this.state.lastMouseY = this.state.mouseY;
        this.state.mouseX = e.offsetX;
        this.state.mouseY = e.offsetY;
        if (this.eventCallbacks.mouseMove) this.eventCallbacks.mouseMove(e);
      }.bind(this));
  
      this.element.addEventListener("mousedown", function(e) {
        this.state.mouseDown = true;
        this.state.startDragX = e.offsetX;
        this.state.startDragY = e.offsetY;
        if (this.eventCallbacks.mouseDown) this.eventCallbacks.mouseDown(e);
      }.bind(this));

      this.element.addEventListener("mouseup", function(e) {
        if (this.eventCallbacks.mouseUp) this.eventCallbacks.mouseUp(e);

        // don't reset anything until after the callback
        this.state.mouseDown = false;
        this.state.startDragX = null;
        this.state.startDragY = null;
      }.bind(this));
  
      this.element.addEventListener("mouseout", function(e) {
        if (this.eventCallbacks.mouseOut) this.eventCallbacks.mouseOut(e);

        // don't reset anything until after the callback
        this.state.mouseDown = false;
        this.state.mouseX = null;
        this.state.mouseY = null;
        this.state.lastMouseX = null;
        this.state.lastMouseY = null;
        this.state.startDragX = null;
        this.state.startDragY = null;
      }.bind(this))
    }

    if (params.init) {
      this.init = params.init.bind(this);
      this.init();
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
