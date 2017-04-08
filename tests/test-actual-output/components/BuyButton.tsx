
import { React, Component } from "React";
import UserInfo from "./UserInfo"


interface Props {}
interface State {}


export default class BuyButton extends Component<Props, State> {
  render() {
    
    return (
      <div b-comp="" b-jsx-lib="react" b-name="BuyButton" b-id="72177">
            <button>buy</button>
            <div>
              <div>Buy as</div>
              <UserInfo />
            </div>
          </div>
    );
  }
}
