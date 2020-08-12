import { ToyReact, Component } from './ToyReact.js';

class MyComponent extends Component {
  render() {
    return <div>
      <span>23</span>
      <span>23222</span>
      {
        true
      }
      {
        this.children
      }
    </div>
  }
}

let a = <MyComponent name="aa">
  <div>
    123123
    </div>
</MyComponent>


ToyReact.render(a, document.body);