import { CodeGeneratorInterface } from "../types";
import { TYPE_LAYOUT, TYPE_LAYOUT_CONTENT } from "../builder";

export default class Component implements CodeGeneratorInterface {
  /**
   * Name of component
   */
  private name: string;
  /**
   * Exactly inner html that is used
   */
  private jsxString: string = "Generic content for replacement";
  /**
   * Another components names
   */
  private externalComponentsNames: string[] = [];

  private codeLinesBeforeRenderReturn: string[] = [];

  private isLayout: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  private addExternalComponentName(name: string) {
    this.externalComponentsNames.push(name);
  }

  public makeLayout() {
    this.isLayout = true;
  }

  public processHTMLElement(el: HTMLElement, componentTag: string, document: Document): void {
    el = el.cloneNode(true) as HTMLElement;

    const innerComponents = Array.from(el.querySelectorAll(componentTag));

    /**
     * For replacing component elements with JSX Components.
     * Like <comp name="Component"></comp> to <Component />
     */
    const replacements: Array<{element: string, component: string}> = [];

    innerComponents.forEach(componentEl => {
      const name: string = componentEl.getAttribute("name");

      if (this.isLayout && componentEl.getAttribute("type") === TYPE_LAYOUT_CONTENT) {
        // For now we omit this iteration, because we will replace comp with layout content later
        // Also, we remove everything from layout content for now

        const layoutContentReplacement: Node = document.createElement(`layout-content-replacement-` + Math.random() * 100000);

        componentEl.parentNode.replaceChild(layoutContentReplacement, componentEl);
      }

      if (!name) {
        return;
      }

      this.addExternalComponentName(name);

      // Creating random name so we could change it in string further
      const customReplacementName: string = "repl-" + (Math.random() * 100000);

      replacements.push({
        element: `<${customReplacementName}></${customReplacementName}>`,
        component: `<${name} />`
      });

      const componentNode = document.createElement(customReplacementName);

      componentEl.parentElement.replaceChild(componentNode, componentEl);
    }, this);

    let jsxString: string = el.innerHTML;

    replacements.forEach(r => {
      jsxString = jsxString.replace(r.element, r.component);
    });

    this.jsxString = jsxString;
  }

  public getName(): string {
    return this.name;
  }

  public generateCode(): string {
    let imports = `
import { h, Component } from "preact";`;

    if (this.externalComponentsNames) {
      this.externalComponentsNames.forEach(module => {
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
${this.jsxString}
      </div>
    )
  }
}
    `;

    return template;
  }


}