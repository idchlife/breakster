import { VirtualComponentInterface } from "./VirtualComponent";

export interface CodeGeneratorInterface {
  attachComponent(c: VirtualComponentInterface);
  generate(): string;
}

function createCodeGenerator() {
  
}

import ReactyCodeGenerator from "./ReactyCodeGenerator";

export {
  ReactyCodeGenerator
}