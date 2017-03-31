import * as fs from "async-file";
import * as jsdom from "jsdom";
import Component from "./parts/component";

class BuilderError extends Error {
  constructor(message: string) {
    super(`[project-builder]: ${message}`);
  }
}

export const TYPE_LAYOUT = "layout";
export const TYPE_LAYOUT_CONTENT = "layout-content";

interface ComponentPreparations {
  [componentName: string]: string;
}

class Builder {
  private inputFile: string;
  private outputFolder: string;
  private tag: string = "comp";

  constructor(inputFile: string, outputFolder: string) {
    if (!inputFile || !outputFolder) {
      throw new BuilderError("You must pass inputFile and outputFolder in Builder constructor");
    }

    this.inputFile = inputFile;
    this.outputFolder = outputFolder;
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

    const document: Document = window.document;

    const componentElements = Array.from(document.querySelectorAll(this.tag));

    if (!componentElements.length) {
      console.info(
        `Could not find any tags for components in file ${this.inputFile}. Did you provide wrong file?`
      );

      return;
    }

    const components: Array<Component> = [];

    componentElements.forEach((el: HTMLElement) => {
      try {
        const name: string = el.getAttribute("name");

        // Custom layout content handling
        if (TYPE_LAYOUT_CONTENT === el.getAttribute("type")) {
          return;
        }

        this.validateComponentElement(el);

        // TODO: provide component with attributes for further extending component
        const component = new Component(name);

        component.processHTMLElement(el, this.tag, document);

        components.push(component);

        console.log(component.generateCode());
      } catch (e) {
        console.error(e.stack);

        throw new BuilderError(
          `Something gone wrong in the building process. Loggin error info before this error.`
        );
      }
    }, this);
  }

  private validateComponentElement(element: HTMLElement) {
    if (!element.getAttribute("name")) {
      throw new BuilderError(
        "In one of your component tags you did not specify 'name' attribute. It is required."
      );
    }
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