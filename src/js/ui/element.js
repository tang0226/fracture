class Element {
  constructor(params, attachEvents = true) {
    this.id = params.id || params.element.id;
    this.element = params.element || document.getElementById(params.id);

    this.dispStyle = params.dispStyle || "block";

    if (params.containerId || params.container) {
      this.containerId = params.containerId || params.container.id;
      this.container = params.container || document.getElementById(this.containerId);  
      this.containerDispStyle = params.containerDispStyle || "block";
    }
    
    if (params.hide) this.element.style.display = "none";
    if (params.hideContainer) this.container.style.display = "none";
    

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

  addLinkedObject(key, obj) {
    this.linkedObjects[key] = obj;
  }

  addLinkedElement(key, element) {
    this.linkedElements[key] = element;
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
