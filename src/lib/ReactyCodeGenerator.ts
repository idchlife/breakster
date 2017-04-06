import { CodeGeneratorInterface } from "./CodeGenerator";
import {
  VirtualComponentInterface,
  ATTR_ID,
  ATTR_DIALECT,
  ATTR_JSX_LIB
} from "./VirtualComponent";

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

interface DialectInterface {
  getRenderArguments?(): string;
  getGenericAfterExtend?(): string;
  getBeforeRenderReturnCode?(): string;

  getAdditionalImports?(): string;

  getComponentProperties?(): string;
}

class DefaultDialect implements DialectInterface {
  getRenderArguments() {
    return "";
  }
}

const JSX_ATTR_LIB = {
  "preact": PreactLibrary,
  "react": ReactLibrary
}

const DIALECT_ATTR_LIB = {
  "js": "js",
  "ts": "ts"
}

class CannotFindElementForComponentError extends Error {}
class InvalidOptionsError extends Error {}

class ComponentNotAttachedError extends Error {}

export default class ReactyCodeGenerator implements CodeGeneratorInterface {
  // By default we use Preact library for jsx component generation
  private library: ReactyLibraryInterface;
  private component: VirtualComponentInterface;

  attachComponent(c: VirtualComponentInterface) {
    this.component = c;

    const el = c.getEl();

    const jsxLibName = el.getAttribute(ATTR_JSX_LIB);

    if (jsxLibName) {

      
      if (!JSX_ATTR_LIB[jsxLibName]) {
        throw new InvalidOptionsError(
          `Element specified ${jsxLibName} in attribute ${ATTR_JSX_LIB}, but it was not valid.
Valid options are: ${Object.keys(JSX_ATTR_LIB)}`
        );
      }

      this.library = new JSX_ATTR_LIB[jsxLibName]();
    } else {
      // This is the default
      this.library = new PreactLibrary();
    }
  }

  public generate(): string {
    const component = this.component;

    if (!component) {
      throw new ComponentNotAttachedError();
    }

    const componentsUsages: string[] = [];

    let additionalImports = ``;

    // We will be first replacing nodes with ids of children with our special nodes,
    // also saving component names so we will use them instead. From <some-id-123></some-id-123>
    // to <Component />
    const replacements: {search: string, replace: string}[] = [];

    const el = component.getEl();

    component.getChildren().forEach(function gatheringImportAndReplacingElement(c) {
      additionalImports += `
import ${c.getName()} from "./${c.getName()}"`;

      const componentElement = el.querySelector(`[${ATTR_ID}="${c.getId()}"]`);

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
    }, this);

    let jsx: string = el.outerHTML;

    replacements.forEach(r => {
      jsx = jsx.replace(r.search, r.replace);
    });

    return `
import { ${this.library.getFactoryFunctionName()}, Component } from ${this.library.getName()};${additionalImports}

export default class ${component.getName()} extends Component {
  render() {
    return (
      ${jsx}
    );
  }
}
`;
  }

  private createFakeReplacementTagName(): string {
    return String(`component-${Math.ceil(Math.random() * 100000)}`);
  }
}