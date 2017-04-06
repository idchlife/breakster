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

  getRenderArguments?(): string;
  
  getGenericAfterExtend?(): string;
  getBeforeRenderReturnCode?(): string;

  getAdditionalImports?(): string;

  getComponentProperties?(): string;

  provideDialect?(d: Dialect);
}

abstract class ReactyLibrary {
  getFactoryFunctionName() { return "" }

  getName() { return "" }

  getRenderArguments() { return "" }
  
  getGenericAfterExtend() { return "" }
  getBeforeRenderReturnCode() { return "" }

  getAdditionalImports() { return "" }

  getComponentProperties() { return "" }

  provideDialect(d: Dialect) {}
}

class PreactLibrary extends ReactyLibrary {
  private component: VirtualComponentInterface;

  private dialect: Dialect;

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

  provideDialect(d: Dialect) {
    this.dialect = d;
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

class Dialect {
  public static getAttrValue(): string {
    // This is default value
    return "";
  }
}

class JavaScript implements Dialect {
  public static getAttrValue(): string {
    return "js";
  }
}

class TypeScript implements Dialect {
  public static getAttrValue(): string {
    return "ts";
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

export default class ReactyCodeGenerator implements CodeGeneratorInterface {
  // By default we use Preact library for jsx component generation
  private library: ReactyLibraryInterface;
  private component: VirtualComponentInterface;

  attachComponent(c: VirtualComponentInterface) {
    this.component = c;

    const el = c.getEl();

    const dialectAttrValue = el.getAttribute(ATTR_DIALECT);
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

    const l: ReactyLibraryInterface = this.library;

    return `
import { ${this.library.getFactoryFunctionName()}, Component } from ${this.library.getName()};${additionalImports}

export default class ${component.getName()} extends Component${l.getGenericAfterExtend && l.getGenericAfterExtend()} {
  render(${l.getRenderArguments()}) {
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