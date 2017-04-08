import { ComponentCodeGeneratorInterface } from './CodeGenerator';
import ReactyCodeGenerator from "./ReactyCodeGenerator";

class VirtualComponentParsingError extends Error {}
class VirtualComponentInvalidElementError extends Error {};

class VirtualComponentInitializationError extends Error {};

const ATTR_NAME = "b-name";
export const ATTR_ID = "b-id";
export const DEFAULT_COMPONENT_ATTR_NAME = "b-comp";
export const ATTR_DIALECT = "b-dialect";
export const ATTR_JSX_LIB = "b-jsx-lib";

export interface VirtualComponentInterface {
  // For getting element, it's attributes, children, etc
  getEl(): HTMLElement;
  // Getting name of the component. Useful for generating code
  getName(): string;
  // For getting id of component which will always be inserted into ATTR_ID
  // in the element. Also id attribute will be there when accessing
  // children from parent (if there is one)
  getId(): string;
  getChildren(): VirtualComponentInterface[];
  getParent(): VirtualComponentInterface | undefined;
  getCodeGenerator(): ComponentCodeGeneratorInterface;
  collectAllSubChildrenAndItself(): VirtualComponentInterface[];
  findAttributeValueThrouItselfAndParents(attr: string): string | undefined;
}

export default class VirtualComponent implements VirtualComponentInterface {
  // This id is for learning that this component is attached to dom element
  // with this id. If there is not id - it's the root component
  private id: string | undefined;
  // Root element
  private el: HTMLElement;
  // Innter components
  private children: VirtualComponentInterface[] = [];
  private parent: VirtualComponentInterface | undefined;
  // Attribute which defies whether dom node is component root or not. It's for finding
  // those nodes and creating components from them.
  private componentAttr: string;
  // Name of this component
  private name: string;

  private codeGenerator: ComponentCodeGeneratorInterface; 

  constructor(
    el: HTMLElement,
    componentAttr: string,
    codeGenerator: ComponentCodeGeneratorInterface = new ReactyCodeGenerator()
  ) {
    if (!componentAttr) {
      throw new VirtualComponentInitializationError(
        "Required argument componentAttr was not provided."
      );
    }

    if (!codeGenerator) {
      throw new VirtualComponentInitializationError(
        "Required argument codeGenerator was not provided."
      );
    }

    this.validateRootElement(el);
    this.el = el;
    this.name = el.getAttribute(ATTR_NAME);
    this.componentAttr = componentAttr;
    this.codeGenerator = codeGenerator;
    this.codeGenerator.attachComponent(this);

    this.parseRootHTMLElement();
  }

  public setCodeGenerator(cg: ComponentCodeGeneratorInterface): VirtualComponent {
    this.codeGenerator = cg;

    return this;
  }

  public getParent() {
    return this.parent;
  }

  public setParent(p: VirtualComponentInterface): VirtualComponent {
    this.parent = p;

    return this;
  }

  public getName() {
    return this.name;
  }

  public getEl() {
    return this.el;
  }

  public getComponentAttr() {
    return this.componentAttr;
  }

  public getChildren() {
    return this.children;
  }

  public setId(id: string): VirtualComponent {
    this.id = id;

    return this;
  }

  public getId() {
    return this.id;
  }

  public getCodeGenerator(): ComponentCodeGeneratorInterface {
    return this.codeGenerator;
  }

  public findAttributeValueThrouItselfAndParents(attr: string): string | undefined {
    const value = this.el.getAttribute(attr);

    if (!value) {
      if (this.parent) {
        return this.parent.findAttributeValueThrouItselfAndParents(attr);
      }

      return undefined;
    }

    return value;
  }

  public collectAllSubChildrenAndItself(): VirtualComponentInterface[] {
    let arr: VirtualComponentInterface[] = [this];

    this.children.forEach(c => arr = arr.concat(c.collectAllSubChildrenAndItself()));

    return arr;
  }

  private validateRootElement(el: HTMLElement) {
    if (!el) {
      throw new VirtualComponentInvalidElementError(
        `Element does not appear to be valid. Type of this element: ${typeof el}`
      );
    }

    if (!el.getAttribute(ATTR_NAME)) {
      throw new VirtualComponentParsingError(
        `Component does not have attr ${ATTR_NAME} or attribute has empty value!

${ATTR_NAME} value: ${el.getAttribute(ATTR_NAME)}

Attributes: ${el.attributes}

Html of this element (without children): ${(el.cloneNode() as HTMLElement).outerHTML}
`
      );
    }
  }

  private parseRootHTMLElement() {
    try {
      let currentEl: HTMLElement = this.el;

      // Elements which is going to be root for inner components
      let discoveredComponentRoots: HTMLElement[] = [];

      if (currentEl.childNodes) {
        let arr: HTMLElement[] = Array.from(currentEl.childNodes).filter(el => el.nodeType === 1) as HTMLElement[];

        // Filling with elements. Also filtered above by nodeType === 1 so
        // we will be working only with element nodes, not text/comment etc
        arr.forEach(function parseChildNode(el) {        
          // If child itself is component root
          if (el.getAttribute(ATTR_NAME)) {
            discoveredComponentRoots.push(el);

            return;
          }

          // Finding first occurence of element in children of this child
          const foundElement = el.querySelector(`[${this.componentAttr}]`) as HTMLElement;

          if (foundElement) {
            discoveredComponentRoots.push(foundElement);
          }
        }, this);
      }

      // Creating inner elements
      discoveredComponentRoots.forEach(function creatingComponent(el) {
        const id = (this as VirtualComponent).generateUniqueId();

        el.setAttribute(ATTR_ID, id);

        const component = new VirtualComponent(
          el.cloneNode(true) as HTMLElement,
          this.componentAttr,
          new ReactyCodeGenerator()
        ).setParent(this).setId(id);

        this.children.push(component);
      }, this);
    } catch (e) {
      console.error(e);

      throw new VirtualComponentParsingError(
        `Error occured while parsing element in VirtualComponent named ${this.getName()}. More info above this error.`
      );
    }
  }

  private generateUniqueId(): string {
    return String(Math.ceil(Math.random() * 100000));
  }
}