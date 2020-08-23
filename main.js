import { ToyReact, Component } from './ToyReact';

class TestComponent extends Component {
  constructor() {
    super();
    this.state = {
      a: 1
    }
  }
  render() {
    return <div id="hello">
      hello world!
      <span>{
          this.state.a.toString()
        }
        </span>
        {
          this.children
        }
      </div>
  }
}

ToyReact.render(<TestComponent name="123"><div>i</div>
  <div>am</div></TestComponent>, document.body)