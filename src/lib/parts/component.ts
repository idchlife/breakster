import { CodeGeneratorInterface } from "../types";

export default class Component implements CodeGeneratorInterface {
  private name: string;
  private externalComponents: Array<string> = [];
  private returnJSX: string;

  constructor(name: string) {

  }

  public getName(): string {
    return this.name;
  }

  public generateCode() {
    const name = "";
    const returnJSX = "";

    const template = `
import { h, Component } from "preact";

export default class ${name} extends Component {
  render() {
    return (
      <div>
        ${returnJSX}
      </div>
    )
  }
}
    `;

    return template;
  }


}