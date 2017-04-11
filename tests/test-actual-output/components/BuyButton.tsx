
import { React, Component } from "React";
import UserInfo from "./UserInfo"


interface Props {}
interface State {}


export default class BuyButton extends Component<Props, State> {
  render() {
    
    return (
      <div>
            <button>buy</button>
            <div>
              <div>Buy as</div>
              <UserInfo />
            </div>
          </div>
    );
  }
}
