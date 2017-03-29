import { h, Component } from "preact";
import UserInfo from "./UserInfo";

export default class Layout extends Component {
  rennder() {
    return (
      <div>
        <header>
          <div>User</div>
          <UserInfo />
        </header>
        {this.props.children}
      </div>
    );
  }
}