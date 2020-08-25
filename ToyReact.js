const RENDER_TO_DOM = Symbol('render to dom')

export class Component {

  constructor(props) {
    this.props = Object.create(null);
    this._root = null;
    this._range = null;
    this.children = []
  }

  get vdom() {
    return this.render().vdom
  }

  get vchildren() {
    return this.children.map(child => child.vdom)
  }

  setAttribute(name, value) {
      this.props[name] = value; 
  }

  appendChild(component) {
    this.children.push(component);
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this.render()[RENDER_TO_DOM](range);
  }


  rerender() {
      this._range.deleteContents();
      this[RENDER_TO_DOM](this._range) 
  }

  setState(newState) {
    if(this.state === null && typeof this.state !== 'object') {
      this.state = newState;
      this.rerender();
      return;
    }

    let merge = (oldState, newState) => {
        for (const key in newState) {
          if(oldState[key] === null || typeof oldState[key] !== 'object') {
            oldState[key] = newState[key]
          } else {
            merge(oldState[key], newState[key]);
          }
        }
    }
    merge(this.state, newState);
    this.rerender();
  }

}
class ElementWrapper extends Component {
    constructor(type) {
      super(type);
      this.type = type;
    }

    get vdom() {
      return this;
    }

    [RENDER_TO_DOM](range) {
      range.deleteContents();

      let root = document.createElement(this.type);

      for (const name in this.props) {
        let value = this.props[name];
        if (name.match(/^on([\s\S]+)/)) {
          root.addEventListener(RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase()), value)
        }
        if (name === 'className') {
          root.setAttribute('class', value)
        } else {
          root.setAttribute(name, value)
        }
      }

      if(!this.vchildren)
      this.vchildren = this.children.map(item => item.vdom);
    
      for (const child of this.vchildren) {
          const childRange = document.createRange();
          childRange.setStart(root, root.childNodes.length);
          childRange.setEnd(root, root.childNodes.length);
          child[RENDER_TO_DOM](childRange);
      }

      range.insertNode(root);
    }

  
}

class TextNodeWrapper extends Component {
  constructor(content) {
    super(content);
    this.root = document.createTextNode(content);
    this.content = content;
    this.type = "#text";
  }

  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
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
        if(!child) {
          return;
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