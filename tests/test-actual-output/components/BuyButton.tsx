
import { React, Component } from "React";
import UserInfo from "./UserInfo"


interface Props {}
interface State {}


export default class BuyButton extends Component<Props, State> {
  render() {
    
    return (
      <div j-comp="" j-jsx-lib="react" j-name="BuyButton" j-id="67073">
            <button>buy</button>
            <div>
              <div>Buy as</div>
              <UserInfo />
            </div>
          </div>
    );
  }
}
