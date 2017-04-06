import { CodeGeneratorInterface } from "./CodeGenerator";
import { VirtualComponentInterface, ATTR_ID } from "./VirtualComponent";

interface ReactyLibraryInterface {
  getFactoryFunctionName(): string;
  getName(): string;
}

class PreactLibrary implements ReactyLibraryInterface {
  getFactoryFunctionName() {
    return "h";
  }

  getName() {
    return "preact";
  }
}

class ReactLibrary implements ReactyLibraryInterface {
  getFactoryFunctionName() {
    return "React";
  }

  getName() {
    return "React";
  }
}

class CannotFindElementForComponentError extends Error {}

export default class ReactyCodeGenerator implements CodeGeneratorInterface {
  private library: ReactyLibraryInterface;

  constructor(library: ReactyLibraryInterface) {
    this.library = library;
  }

  public generateCode(component: VirtualComponentInterface): string {
    const componentsUsages: string[] = [];

    let additionalImports = ``;

    // We will be first replacing nodes with ids of children with our special nodes,
    // also saving component names so we will use them instead. From <some-id-123></some-id-123>
    // to <Component />
    const replacements: {search: string, replace: string}[] = [];

    const el = component.getEl();

    component.getChildren().forEach(c => {
      additionalImports += `
import ${c.getName()} from "./${c.getName()}"`;

      const componentElement = el.querySelector(`[${ATTR_ID}="${c.getId()}]"`);

      if (!componentElement) {
        throw new CannotFindElementForComponentError(
          `Was trying to find element with ${ATTR_ID}=${c.getId()} from component ${c.getName()}. Could not find.`
        );
      }

      const fakeReplacementTagName = this.createFakeReplacementTagName();

      // Replacing this element with fake, which will be then replaced in string
      componentElement.parentElement.replaceChild(
        el.ownerDocument.createElement(fakeReplacementTagName),
        componentElement
      );

      // Creating replacements for fututre components
      replacements.push({
        search: `<${fakeReplacementTagName}></${fakeReplacementTagName}>`,
        replace: `<${c.getName()} />`
      });
    });

    const jsx: string = el.innerHTML;

    replacements.forEach(r => {
      jsx.replace(r.search, r.replace);
    });

    return `
import { ${this.library.getFactoryFunctionName()}, Component } from ${this.library.getName()};
${additionalImports}

export default class ${component.getName()} extends Component {
  render() {
    return (
      <div>
        ${jsx}
      </div>
    );
  }
}
`;
  }

  private createFakeReplacementTagName(): string {
    return String(`component-${Math.ceil(Math.random() * 100000)}`);
  }
}