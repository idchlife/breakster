
import { h, Component } from "preact";
import UserInfo from "./UserInfo"
import Product from "./Product"
import Table from "./Table"


interface Props {}
interface State {}


export default class Layout extends Component<Props, State> {
  render(props, state) {
    
    return (
      <div>
        <header>
          <div>User</div>
          <UserInfo />
        </header>
        <Product />
        <Table />
      </div>
    );
  }
}
