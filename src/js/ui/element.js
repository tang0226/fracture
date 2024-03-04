class Element {
  constructor(params, attachEvents = true) {
    this.id = params.id;
    this.element = document.getElementById(this.id);

    this.dispStyle = params.dispStyle || "block";

    if (params.containerId) {
      this.containerId = params.containerId;
      this.container = document.getElementById(this.containerId);  
      this.containerDispStyle = params.containerDispStyle || "block";
    }

    // Linked element objects
    if (params.linkedObjects) this.linkedObjects = params.linkedObjects;
    
    // DOM elements
    if (params.linkedElements) this.linkedElements = params.linkedElements;

    if (params.eventCallbacks && attachEvents) {
      this.eventCallbacks = params.eventCallbacks;
      let keys = Object.keys(this.eventCallbacks);
      for (let i in keys) {
        let key = keys[i];
        let callback = this.eventCallbacks[key];
        this.element.addEventListener(
          key.toLowerCase(), callback.bind(this)
        );
      }
    }
  }

  show() {
    this.element.style.display = this.dispStyle;
  }

  hide() {
    this.element.style.display = "none";
  }

  showContainer() {
    this.container.style.display = this.containerDispStyle;
  }

  hideContainer() {
    this.container.style.display = "none";
  }
}
