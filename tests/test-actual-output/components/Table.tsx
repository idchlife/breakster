
import { h, Component } from "preact";
import TableRow from "./TableRow"


interface Props {}
interface State {}


export default class Table extends Component<Props, State> {
  render(props, state) {
    
    return (
      <table>
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
