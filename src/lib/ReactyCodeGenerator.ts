import { CodeGeneratorInterface, ComponentCodeGeneratorInterface } from './CodeGenerator';
import {
  ATTR_DIALECT,
  ATTR_ID,
  ATTR_JSX_LIB,
  ATTR_NAME,
  DEFAULT_COMPONENT_ATTR_NAME,
  VirtualComponentInterface
} from './VirtualComponent';

const STRIP_DEFAULT_ATTRIBUTES: string[] = [
  ATTR_NAME,
  ATTR_ID,
  ATTR_DIALECT,
  ATTR_JSX_LIB,
  DEFAULT_COMPONENT_ATTR_NAME
];

// console.log('Debug: got from early import', STRIP_DEFAULT_ATTRIBUTES);

interface ReactyLibraryInterface {
  getFactoryFunctionName(): string;
  getName(): string;
  getRenderArguments?(): string;
  getGenericAfterExtend?(): string;
  getBeforeRenderReturnCode?(): string;
  getAdditionalImports?(): string;
  getComponentProperties?(): string;
  getBeforComponentDeclarationCode?(): string;
  provideDialect?(d: Dialect);
  getDialect?(): Dialect;
}

abstract class ReactyLibrary {
  // Default dialect is JavaScript
  protected dialect: Dialect = new JavaScript();

  getFactoryFunctionName() { return "" }

  getName() { return "" }

  getRenderArguments() { return "" }
  
  getGenericAfterExtend() {
    if (this.dialect instanceof TypeScript) {
      return "<Props, State>";
    }

    return "";
  }
  getBeforeRenderReturnCode() { return "" }

  getAdditionalImports() { return "" }

  getComponentProperties() { return "" }

  getBeforComponentDeclarationCode?(): string {
    if (this.dialect instanceof TypeScript) {
      return `
interface Props {}
interface State {}
`
    }

    return "";
  };

  provideDialect(d: Dialect) {
    this.dialect = d;
  }

  public getDialect(): Dialect {
    return this.dialect;
  }
}

class PreactLibrary extends ReactyLibrary {
  private component: VirtualComponentInterface;

  constructor(c: VirtualComponentInterface) {
    super();

    this.component = c;
  }

  getFactoryFunctionName() {
    return "h";
  }

  getName() {
    return "preact";
  }

  getRenderArguments(): string {
    return "props, state";
  }
}

class ReactLibrary extends ReactyLibrary {
  getFactoryFunctionName() {
    return "React";
  }

  getName() {
    return "React";
  }
}

abstract class Dialect {
  public getFileExtension(): string {
    return "jsx";
  }
  public static getAttrValue(): string {
    // This is default value
    return "";
  }
}

class JavaScript extends Dialect {
  public static getAttrValue(): string {
    return "javascript";
  }
}

class TypeScript extends Dialect {
  public getFileExtension(): string {
    return "tsx";
  }

  public static getAttrValue(): string {
    return "typescript";
  }
}

const JSX_ATTR_LIB = {
  "preact": PreactLibrary,
  "react": ReactLibrary
}

const DIALECT_ATTR_LIB = {
  [JavaScript.getAttrValue()]: JavaScript,
  [TypeScript.getAttrValue()]: TypeScript
}

class CannotFindElementForComponentError extends Error {}
class InvalidOptionsError extends Error {}

class ComponentNotAttachedError extends Error {}

class ComponentWasNotYetParserError extends Error {}

export default class ReactyCodeGenerator implements ComponentCodeGeneratorInterface {
  // By default we use Preact library for jsx component generation
  private library: ReactyLibraryInterface;
  private component: VirtualComponentInterface;
  private componentProcessed: boolean = false;

  attachComponent(c: VirtualComponentInterface) {
    this.component = c;
  }

  private processComponent() {
    const c = this.component;

    const el = c.getEl();

    let dialectAttrValue = c.findAttributeValueThrouItselfAndParents(ATTR_DIALECT);
    
    // Trying to find dialect from parent components

    let dialect: Dialect;

    if (dialectAttrValue) {
      if (!DIALECT_ATTR_LIB[dialectAttrValue]) {
        throw new InvalidOptionsError(
          `Invalid dialect via ${ATTR_DIALECT} attribute, allowed dialects: ${Object.keys(DIALECT_ATTR_LIB)}`
        )
      }

      dialect = new DIALECT_ATTR_LIB[dialectAttrValue]();
    } else {
      dialect = new JavaScript();
    }

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
      this.library = new PreactLibrary(c);
    }

    if (this.library.provideDialect) {
      this.library.provideDialect(dialect);
    }

    this.componentProcessed = true;
  }

  public generate(): string {
    if (!this.componentProcessed) {
      this.processComponent();
    }

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

    let el = component.getEl();

    component.getChildren().forEach(function gatheringImportAndReplacingElement(c) {
      additionalImports += `
import ${c.getName()} from "./${c.getName()}"`;

      const componentElement = el.querySelector(`[${ATTR_ID}="${c.getId()}"]`);

      if (!componentElement) {
        throw new CannotFindElementForComponentError(
          `Was trying to find element with ${ATTR_ID}=${c.getId()} from component ${c.getName()}. Could not find.`
        );
      }

      const fakeReplacementTagName = (this as ReactyCodeGenerator).createFakeReplacementTagName();

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

    // Before making changes to element we clone it, so other children/parent
    // elements wont be affected by changed element
    el = el.cloneNode(true) as HTMLElement;

    const defaultAttrsToStrip: string[] = [
      ATTR_NAME,
      ATTR_ID,
      ATTR_DIALECT,
      ATTR_JSX_LIB,
      DEFAULT_COMPONENT_ATTR_NAME
    ];

    // Stripping default attributes
    defaultAttrsToStrip.forEach(attr => {
      el.removeAttribute(attr);
    });

    let jsx: string = el.outerHTML;

    replacements.forEach(r => {
      jsx = jsx.replace(r.search, r.replace);
    });

    const l: ReactyLibraryInterface = this.library;

    return `
import { ${this.library.getFactoryFunctionName()}, Component } from "${this.library.getName()}";${additionalImports}

${l.getBeforComponentDeclarationCode()}

export default class ${component.getName()} extends Component${l.getGenericAfterExtend()} {
  render(${l.getRenderArguments()}) {
    ${l.getBeforeRenderReturnCode()}
    return (
      ${jsx}
    );
  }
}
`;
  }

  public getComponent(): VirtualComponentInterface {
    return this.component;
  }

  public getFileExtension(): string {
    if (!this.componentProcessed) {
      this.processComponent();
    }

    return this.library.getDialect().getFileExtension();
  }

  private createFakeReplacementTagName(): string {
    return String(`component-${Math.ceil(Math.random() * 100000)}`);
  }
}