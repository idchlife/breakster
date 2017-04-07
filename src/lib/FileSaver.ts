import { ComponentCodeGeneratorInterface } from './CodeGenerator';
import * as fs from "async-file";
interface FileSaverInterface {
  save(dir: string, g: ComponentCodeGeneratorInterface);
}

class FolderCannotBeAccessedError extends Error {}

export default class ComponentFileSaver implements FileSaverInterface {
  async save(dir: string, g: ComponentCodeGeneratorInterface) {
    let originalDir = dir;

    if (originalDir[originalDir.length - 1] === "/") {
      originalDir = originalDir.slice(0, originalDir.length - 1);
    }

    const saveToDir = `${originalDir}/components`;

    try {
      await fs.stat(saveToDir);
    } catch (e) {
      console.error(e);

      throw new FolderCannotBeAccessedError(
        `Tried to access folder ${saveToDir}, but apparently it doesn't exist or not accessible. More info: above`
      );
    }


  }
}