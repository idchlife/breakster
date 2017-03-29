import { CodeGeneratorInterface } from "../types";

export default class Component implements CodeGeneratorInterface {
  /**
   * Name of component
   */
  private name: string;
  /**
   * Exactly inner html that is used
   */
  private content: string = "Generic content for replacement";
  /**
   * Another components names
   */
  private localImports: Array<string> = [];

  constructor(name: string) {
    this.name = name;
  }

  addExternalComponentName(name: string) {
    this.localImports.push(name);
  }

  public setContent(content: string) {
    this.content = content;
  }

  public getName(): string {
    return this.name;
  }

  public generateCode() {
    let imports = `
import { h, Component } from "preact";`;

    if (this.localImports) {
      this.localImports.forEach(module => {
        imports +=
`
import ${module} from "./${module}";`;
      });
    }

    const template = `
${imports}

export default class ${this.name} extends Component {
  render() {
    return (
      <div>
${this.content}
      </div>
    )
  }
}
    `;

    return template;
  }


}