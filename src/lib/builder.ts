import { ComponentFileSaver } from './FileSaver';
import * as fs from "async-file";
import * as jsdom from "jsdom";
import VirtualComponent, {
  DEFAULT_COMPONENT_ATTR_NAME,
  VirtualComponentInterface
} from './VirtualComponent';
import { ReactyCodeGenerator } from "./CodeGenerator";


class BuilderError extends Error {
  constructor(message: string) {
    super(`[project-builder]: ${message}`);
  }
}

export const TYPE_LAYOUT = "layout";
export const TYPE_LAYOUT_CONTENT = "layout-content";

const ALLOWED_LANGUAGES = [
  "javascript",
  "typescript"
];

const FILE_EXTENSIONS = {
  [ALLOWED_LANGUAGES[0]]: "jsx",
  [ALLOWED_LANGUAGES[0]]: "tsx"
};

class Builder {
  private inputFile: string;
  private outputFolder: string;
  private debug: boolean = false;

  constructor(inputFile: string, outputFolder: string, debug = true) {
    if (!inputFile || !outputFolder) {
      throw new BuilderError("You must pass inputFile and outputFolder in Builder constructor");
    }

    this.inputFile = inputFile;
    this.outputFolder = outputFolder;
    this.debug = debug;
  }

  public setLanguage(lang: string) {
    if (!ALLOWED_LANGUAGES.find(l => l === lang)) {
      throw new BuilderError(
        `Language ${lang} is not supported`
      );
    }
  }

  public async build() {
    await this.checkPrerequisites();

    // Getting string content from file
    const fileContents: string = await fs.readFile(this.inputFile, {
      encoding: "utf8"
    });

    // Wrapper so async/await can work
    const window: Window = await new Promise<Window>(function(resolve) {
      jsdom.env(fileContents, {
        done: function(error, window) {
          if (error) {
            console.error(error);
          } else {
            resolve(window);
          }
        }
      });
    });

    const document: Document = window.document

    // Finding first occurence of component element
    const rootComponentElement = document.body.querySelector(`[${DEFAULT_COMPONENT_ATTR_NAME}]`);

    if (!rootComponentElement) {
      throw new BuilderError("Could not find single element suited for component creation. Check your html.");
    }

    const codeGenerator = new ReactyCodeGenerator();

    try {
      const rootComponent = new VirtualComponent(
        rootComponentElement as HTMLElement,
        DEFAULT_COMPONENT_ATTR_NAME
      );

      const components: VirtualComponentInterface[] = rootComponent.collectAllSubChildrenAndItself();

      const fileSaver = new ComponentFileSaver();

      for (let i = 0, size = components.length; i < size; i++) {
        const c = components[i];

        await await fileSaver.save(this.outputFolder, c.getCodeGenerator());
      }
    } catch (e) {
      console.error(e);

      throw new BuilderError("There was an error while build process was active. Above - more info on error.");
    }

    // await componentElements.forEach(async (el: HTMLElement) => {
    //   try {
    //     const name: string = el.getAttribute("name");

    //     // Custom layout content handling
    //     if (TYPE_LAYOUT_CONTENT === el.getAttribute("type")) {
    //       return;
    //     }

    //     // If component has no children and has name of already
    //     // created Component, omit it
    //     if (components.find(c => c.getName() === name) && !el.childNodes.length) {
    //       return;
    //     }

    //     this.validateComponentElement(el);

    //     // TODO: provide component with attributes for further extending component
    //     const component = new Component(name, this.language);

    //     component.processHTMLElement(el, this.tag, document);

    //     components.push(component);

    //     if (this.debug) {
    //       console.log(component.generateCode());
    //     } else {
    //       // Using output folder
    //       let outDir = this.outputFolder;
    //       let componentOutDir = outDir[outDir.length - 1] === "/" ? outDir + "components/" : outDir + "/components/";

    //       await fs.writeFile(
    //         componentOutDir + `${name}.${FILE_EXTENSIONS[this.language]}`,
    //         component.generateCode()
    //       );
    //     }

    //     // Saving component output into file
        
    //   } catch (e) {
    //     console.error(e.stack);

    //     throw new BuilderError(
    //       `Something gone wrong in the building process. Loggin error info before this error.`
    //     );
    //   }
    // }, this);
  }

  private async checkPrerequisites() {
    try {
      await fs.stat(this.inputFile);
    } catch (e) {
      throw new BuilderError(
        `File ${this.inputFile} does not exist or not available for read`
      );
    }

    try {
      await fs.stat(this.outputFolder);
    } catch (e) {
      throw new BuilderError(
        `Folder ${this.outputFolder} is not available for writing or does not exist`
      );
    }

    return true;
  }
}

export default Builder;