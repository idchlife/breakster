
import { h, Component } from "preact";


interface Props {}
interface State {}


export default class TableRow extends Component<Props, State> {
  render(props, state) {
    
    return (
      <tr>
              <td>First</td>
              <td>Second</td>
              <td>Third</td>
            </tr>
    );
  }
}
