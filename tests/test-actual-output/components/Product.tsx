
import { h, Component } from "preact";
import BuyButton from "./BuyButton"


interface Props {}
interface State {}


export default class Product extends Component<Props, State> {
  render(props, state) {
    
    return (
      <div b-comp="" b-name="Product" b-id="62077">
          <div>Product name</div>
          <div>Product price</div>
          <div>Product count</div>
          <BuyButton />
        </div>
    );
  }
}
