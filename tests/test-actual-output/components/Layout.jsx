
import { h, Component } from "preact";
import UserInfo from "./UserInfo"
import Product from "./Product"
import Table from "./Table"



export default class Layout extends Component {
  render(props, state) {
    
    return (
      <div j-comp="" j-name="Layout" j-id="95437">
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
