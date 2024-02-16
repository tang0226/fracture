/******************************
INPUT CLASS: Object for manipulating HTML inputs
******************************/ 

class Input {
  constructor(eleId, params) {
    this.eleId = eleId;
    this.element = document.getElementById(eleId);
    
    this.type = this.element.type;
    this.dispStyle = params.dispStyle || "block";
    
    this.val = params.val || this.element.value;
    
    this.container = document.getElementById(params.containerId);
    this.linkedElements = params.linkedElements;

    this.eventCallbacks = params.eventCallbacks;

    if (this.eventCallbacks) {
      let keys = Object.keys(this.eventCallbacks);
      for(let i in keys) {
        let key = keys[i];
        let callback = this.eventCallbacks[key];
        this.element.addEventListener(
          key, callback.bind(this)
        );
      }
    }
  }

  show() {
    if (this.container) {
      this.container.style.display = "block";
    }
    this.element.style.display = this.dispStyle;
  }

  hide() {
    if (this.container) {
      this.container.style.display = "none";
    }
    this.element.style.display = "none";
  }

  set(val){
    this.val = val;
    this.element.value = val;
  }

  update() {
    this.val = this.element.value;
  }
}

/**
class HTMLExample extends HTMLElement{
  constructor(){
  super();
  this.count = 0;
  this.addEventListener('click', this.onClick.bind(this), false);    
  }
  
  onClick(event){
  let prevCount = this.count;
  this.count++;  
  let msg = `Increased Count from ${prevCount} to ${this.count}`;
  document.getElementById("log").innerHTML += `${msg}<br/>`;   
  }
}
 */
