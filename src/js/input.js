class Input {
  constructor(eleId, type, params) {
    this.eleId = eleId;
    this.element = document.getElementById(eleId);
    switch (type) {
      case "text":
        
        break;
    }
  }

  show() {
    
  }

  hide() {

  }

  set(){

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
