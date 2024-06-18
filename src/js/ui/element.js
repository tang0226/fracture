class Element {
  constructor(params, attachEvents = true, initNow = true) {
    this.id = params.id || params.element.id;
    this.element = params.element || document.getElementById(params.id);

    this.dispStyle = params.dispStyle || "block";
    this.element.style.display = this.dispStyle;    

    if (params.containerId || params.container) {
      this.containerId = params.containerId || params.container.id;
      this.container = params.container || document.getElementById(this.containerId);  
      this.containerDispStyle = params.containerDispStyle || "block";
    }
    
    if (params.hide) this.element.style.display = "none";
    if (params.hideContainer) this.container.style.display = "none";
    

    // Linked element objects
    this.linked = params.linked || {};

    this.state = params.state || {};

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

    if (params.utils) {
      this.utils = {};
      let keys = Object.keys(params.utils);
      for (let i in keys) {
        let key = keys[i];
        let util = params.utils[key];
        this.utils[key] = util.bind(this);
      }
    }
    
    // Define here, not outside, to have an alias
    this.addLinkedObject = this.link = function(obj) {
      for (let key of Object.keys(obj)) {
        this.linked[key] = obj[key];
      }
    };

    if (params.init && initNow) {
      this.init = params.init.bind(this);
      this.init();
    }
  }

  show(dispStyle) {
    this.element.style.display = dispStyle || this.dispStyle;
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
