import { h, Component } from "preact";

export default class Product extends Component {
  render() {
    return (
      <div>
        <div>Product name</div>
        <div>Product price</div>
        <div>Product count</div>
        <button>buy</button>
      </div>
    );
  }
}