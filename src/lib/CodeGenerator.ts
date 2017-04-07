import { VirtualComponentInterface } from "./VirtualComponent";

export interface CodeGeneratorInterface {
  attachComponent(c: VirtualComponentInterface);
  generate(): string;
}

export interface ComponentCodeGeneratorInterface extends CodeGeneratorInterface {
  attachComponent(c: VirtualComponentInterface);
}

function createCodeGenerator() {
  
}

import ReactyCodeGenerator from "./ReactyCodeGenerator";

export {
  ReactyCodeGenerator
}