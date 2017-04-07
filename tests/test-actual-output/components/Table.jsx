
import { h, Component } from "preact";
import TableRow from "./TableRow"



export default class Table extends Component {
  render(props, state) {
    
    return (
      <table j-comp="" j-name="Table" j-id="67277">
          <thead>
            <tr>
              <td>Header first</td>
              <td>Header second</td>
              <td>Header third</td>
            </tr>
          </thead>
          <tbody>
            <TableRow />
          </tbody>
        </table>
    );
  }
}
