
import { h, Component } from "preact";
import BuyButton from "./BuyButton"



export default class Product extends Component {
  render(props, state) {
    
    return (
      <div j-comp="" j-name="Product" j-id="14862">
          <div>Product name</div>
          <div>Product price</div>
          <div>Product count</div>
          <BuyButton />
        </div>
    );
  }
}
