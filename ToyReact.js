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

  update() {

    let isSameNode = (oldNode, newNode) => {
      if(oldNode.type !== newNode.type) {
        return false
      }

      for (const key in newNode.props) {
        if (oldNode.props[key] !== newNode.props[key]) {
            return false
        }
      }

      if(Object.keys(oldNode.props).length >  Object.keys(newNode.props).length)
      return false

      if(newNode.type === "#text") {
        if(newNode.content !== oldNode.content) {
          return false;
        }
      }


      return true;
    }

    let update = (oldNode, newNode) => {
      debugger;
      if(!isSameNode(oldNode, newNode)) {
          newNode[RENDER_TO_DOM](oldNode._range)
          return;
      }

      newNode._range = oldNode._range;

      let newChildren = newNode.vchildren;
      let oldChildren = oldNode.vchildren;

      for (let index = 0; index < newChildren.length; index++) {
        const newChild = newChildren[index];
        const oldChild = oldChildren[index];
        if(index < oldChildren.length) {
          update(oldChild, newChild);
        } else {
          // 
        }
      }
    }

    let vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;

  }

  setState(newState) {
    if(this.state === null && typeof this.state !== 'object') {
      this.state = newState;
      this.update();
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
    this.update();
  }

}
class ElementWrapper extends Component {
    constructor(type) {
      super(type);
      this.type = type;
    }

    get vdom() {
      this.vchildren = this.children.map(item => item.vdom)
      return this;
    }

    [RENDER_TO_DOM](range) {
      this._range = range
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
    this._range = range
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