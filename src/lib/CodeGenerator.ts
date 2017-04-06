import { VirtualComponentInterface } from "./VirtualComponent";

export interface CodeGeneratorInterface {
  generateCode(component: VirtualComponentInterface): string;
}