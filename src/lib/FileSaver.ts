import { ComponentCodeGeneratorInterface } from './CodeGenerator';
import * as fs from "async-file";
interface FileSaverInterface {
  save(dir: string, g: ComponentCodeGeneratorInterface);
}

class FolderCannotBeAccessedError extends Error {}
class SavingToFileError extends Error {}

export class ComponentFileSaver implements FileSaverInterface {
  async save(dir: string, g: ComponentCodeGeneratorInterface) {
    let originalDir = dir;

    if (originalDir[originalDir.length - 1] === "/") {
      originalDir = originalDir.slice(0, originalDir.length - 1);
    }

    const saveToDir = `${originalDir}/components`;

    try {
      await fs.stat(originalDir);

      if (!fs.exists(`${originalDir}/components`)) {
        await fs.mkdir(`${originalDir}/components`);
      }
    } catch (e) {
      console.error(e);

      throw new FolderCannotBeAccessedError(
        `Tried to access folder ${saveToDir}, but apparently it doesn't exist or not accessible. More info: above`
      );
    }

    const fileName = `${g.getComponent().getName()}.${g.getFileExtension()}`;

    const filePath = `${saveToDir}/${fileName}`;

    try {
      await fs.writeFile(filePath, g.generate());

      console.log(`Saved ${filePath}`);
    } catch (e) {
      console.error(e);

      throw new SavingToFileError(
        `Error saving to ${filePath}. More - above this error.`
      );
    }
  }
}