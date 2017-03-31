import { CodeGeneratorInterface } from "../types";
import { TYPE_LAYOUT, TYPE_LAYOUT_CONTENT } from "../builder";

interface Replacement {
  element: string,
  component: string
}

type Replacements = Array<Replacement>;

export default class Component implements CodeGeneratorInterface {
  /**
   * Name of component
   */
  private name: string;
  /**
   * Exactly inner html that is used
   */
  private jsxString: string = "Generic content for replacement";

  private jsxHasSingleNode: string = "";

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

    el = this.removeEverythingFromLayoutsExceptContent(el);
    
    // If this component is layout we should also do some different processing
    if (el.getAttribute("type") === TYPE_LAYOUT) {
      this.isLayout = true;

      // Before processing all component we should clear layout-content, so inner
      // components wonts be used in imports
      const layoutContentEl = el.querySelector(`[type="${TYPE_LAYOUT_CONTENT}"]`);

      if (layoutContentEl) {
        layoutContentEl.parentNode.replaceChild(layoutContentEl.cloneNode(), layoutContentEl);
      }
    }

    /**
     * For replacing component elements with JSX Components.
     * Like <comp name="Component"></comp> to <Component />
     */
    const replacements: Replacements = [];

    // First we replacing all type="layout" components.

    const innerComponents = Array.from(el.querySelectorAll(componentTag));

    innerComponents.forEach(componentEl => {
      // console.log(`Inside component ${this.name} working with component ${componentEl.getAttribute("name")}`);
      const name: string = componentEl.getAttribute("name");

      // When this component itself is layout and there is layout-content inside
      if (this.isLayout && componentEl.getAttribute("type") === TYPE_LAYOUT_CONTENT) {
        // For now we omit this iteration, because we will replace comp with layout content later
        // Also, we remove everything from layout content for now

        const layoutReplacementNodeName = `layout-content-replacement-` + Math.random() * 100000;

        const layoutContentReplacement: Node = document.createElement(
          layoutReplacementNodeName
        );

        componentEl.parentNode.replaceChild(layoutContentReplacement, componentEl);

        // layout-content code is different from other code, because it uses props.children inside,
        // that's it. And DOM element simply dissapears
        replacements.push({
          element: `<${layoutReplacementNodeName}></${layoutReplacementNodeName}>`,
          component: "{props.children}"
        });

        return;
      }

      if (!name) {
        return;
      }

      // We need to import this component
      this.addExternalComponentName(name);

      // Creating random name so we could change it in string further
      const customReplacementName: string = "repl-" + (Math.random() * 100000);
      const customReplacementNameTag: string = `<${customReplacementName}></${customReplacementName}>`;

      // When we're dealing with layout inside of this component we should wrap content inside layout
      // in layout component. Basicalle prepend and append
      if (componentEl.getAttribute("type") === TYPE_LAYOUT) {
        

        // We need custom replacement for Layout
        replacements.push({
          element: `<${customReplacementName}>`,
          component: `
<${name}>
          `
        });

        replacements.push({
          element: `</${customReplacementName}>`,
          component: `
</${name}>
          `
        });
      } else {
        // Dealing with simple component
        replacements.push({
          element: customReplacementNameTag,
          component: `<${name} />`
        });
      }

      const componentNode = document.createElement(customReplacementName);

      // If this is Layout element we also should append all children
      if (componentEl.getAttribute("type") === TYPE_LAYOUT) {
        Array.from(componentEl.childNodes).forEach(n => componentNode.appendChild(n));
      }

      componentEl.parentElement.replaceChild(componentNode, componentEl);
    }, this);

    let jsxString: string = el.innerHTML;

    // Replacing every component
    replacements.forEach(r => {
      jsxString = jsxString.replace(r.element, r.component);
    });

    // Removing new lines from beginning and ending of string
    this.jsxString = jsxString.replace(/^\s+|\s+$/g, "");;
  }

  /**
   * This method strips everything from the layout so it will have only content to wrap,
   * no insides of exactly layout (insides will be in layout component)
   */
  private removeEverythingFromLayoutsExceptContent(el: HTMLElement): HTMLElement {
    // Finding layouts
    const layoutsEls = Array.from(el.querySelectorAll(`[type="${TYPE_LAYOUT}"]`));

    layoutsEls.forEach(layoutEl => {
      // If there is no content, simply omitting it
      let contentEl = layoutEl.querySelector(`[type="${TYPE_LAYOUT_CONTENT}"]`);

      if (!contentEl) {
        return;
      }

      contentEl = contentEl.cloneNode(true) as HTMLElement;

      // Removing everything
      Array.from(layoutEl.childNodes).forEach(n => n.parentElement.removeChild(n));

      // And now inserting just content
      Array.from(contentEl.childNodes).forEach(n => layoutEl.appendChild(n));
    });

    return el;
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