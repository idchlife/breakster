import { VirtualComponentInterface } from "./VirtualComponent";

export interface CodeGeneratorInterface {
  attachComponent(c: VirtualComponentInterface);
  generate(): string;
}

export interface ComponentCodeGeneratorInterface extends CodeGeneratorInterface {
  attachComponent(c: VirtualComponentInterface);
  getComponent(): VirtualComponentInterface;
  getFileExtension(): string;
}

function createCodeGenerator() {
  
}

import ReactyCodeGenerator from "./ReactyCodeGenerator";

export {
  ReactyCodeGenerator
}