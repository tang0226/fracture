class Element {
  constructor(params) {
    this.id = params.id;
    this.element = document.getElementById(this.id);
    
    if (params.containerId) {
      this.containerId = params.containerId;
      this.container = document.getElementById(this.containerId);  
    }

    if (params.linkedElements) this.linkedElements = params.linkedElements;

    this.dispStyle = params.dispStyle || "block";

    if (params.eventCallbacks) {
      this.eventCallbacks = params.eventCallbacks;
      let keys = Object.keys(this.eventCallbacks);
      for (let i in keys) {
        let key = keys[i];
        let callback = this.eventCallbacks[key];
        this.element.addEventListener(
          key, callback.bind(this)
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
    this.container.style.display = "block";
  }

  hideContainer() {
    this.container.style.display = "none";
  }
}