const RENDER_TO_DOM = Symbol('render to dom')

class ElementWrapper {
    constructor(type) {
      this.root = document.createElement(type)
    }

    setAttribute(name, value) {
      this.root.setAttribute(name, value)
    }

    appendChild(component) {
      const range = document.createRange();
      range.setStart(this.root, this.root.childNodes.length);
      range.setEnd(this.root, this.root.childNodes.length);
      component[RENDER_TO_DOM](range);
    }

    [RENDER_TO_DOM](range) {
      range.deleteContents();
      range.insertNode(this.root);
    }

}

class TextNodeWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {

  constructor(props) {
    this.props = Object.create(null);
    this._root = null;
    this.children = []
  }


  setAttribute(name, value) {
      this.props[name] = value; 
  }

  appendChild(component) {
    this.children.push(component);
  }

  [RENDER_TO_DOM](range) {
    this.render()[RENDER_TO_DOM](range);
  }

}

export const ToyReact = {
  createElement(type, attributes, ...children) {
    let element;
    if(typeof type === 'string') {
       element = new ElementWrapper(type);
    } else {
      element = new type;
    }

    for (let name in attributes) {
      element.setAttribute(name, attributes[name])
    }

    function insertChildren(children) {
      for (let child of children) {
        if(typeof child === 'string') {
          child = new TextNodeWrapper(child)
        }
        if(typeof child === 'object' && child instanceof Array) {
          insertChildren(child);
          return;
        }
        element.appendChild(child)
      }
    }

    insertChildren(children);
    
    return element;
  },

  render(component, parentElement) {
    const range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range)
  }
}