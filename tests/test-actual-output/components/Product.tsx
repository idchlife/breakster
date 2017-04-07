
import { h, Component } from "preact";
import BuyButton from "./BuyButton"


interface Props {}
interface State {}


export default class Product extends Component<Props, State> {
  render(props, state) {
    
    return (
      <div j-comp="" j-name="Product" j-id="56907">
          <div>Product name</div>
          <div>Product price</div>
          <div>Product count</div>
          <BuyButton />
        </div>
    );
  }
}
