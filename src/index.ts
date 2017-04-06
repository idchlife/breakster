import Builder from "./lib/builder";
import VirtualComponent from "./lib/VirtualComponent";
import * as minimist from "minimist";
import * as path from "path";



export {
  Builder,
  VirtualComponent
}

function processFromCLI() {
  // This is from console

  const argv = minimist(process.argv.slice(2));

  if (!argv["entry"]) {
    console.error("--entry option should be defined. It's your .html file");

    return;
  }

  if (!argv["outDir"]) {
    console.error("--outDir option should be defined. It's your folder where would be stored all files");

    return;
  }

  const currentDir: string = process.cwd();

  let { entry, outDir, language } = argv;

  if (!path.isAbsolute(entry)) {
    entry = currentDir + "/" + entry;
  }

  if (!path.isAbsolute(outDir)) {
    outDir = currentDir + "/" + outDir;
  }

  const builder = new Builder(entry, outDir, false);

  if (language) {
    builder.setLanguage(language);
  }

  builder.build();
}

if (require.main === module) {
  processFromCLI();
} 