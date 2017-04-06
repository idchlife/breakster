"use strict";
exports.__esModule = true;
var builder_1 = require("./lib/builder");
exports.Builder = builder_1["default"];
var VirtualComponent_1 = require("./lib/VirtualComponent");
exports.VirtualComponent = VirtualComponent_1["default"];
var minimist = require("minimist");
var path = require("path");
function processFromCLI() {
    // This is from console
    var argv = minimist(process.argv.slice(2));
    if (!argv["entry"]) {
        console.error("--entry option should be defined. It's your .html file");
        return;
    }
    if (!argv["outDir"]) {
        console.error("--outDir option should be defined. It's your folder where would be stored all files");
        return;
    }
    var currentDir = process.cwd();
    var entry = argv.entry, outDir = argv.outDir, language = argv.language;
    if (!path.isAbsolute(entry)) {
        entry = currentDir + "/" + entry;
    }
    if (!path.isAbsolute(outDir)) {
        outDir = currentDir + "/" + outDir;
    }
    var builder = new builder_1["default"](entry, outDir, false);
    if (language) {
        builder.setLanguage(language);
    }
    builder.build();
}
if (require.main === module) {
    processFromCLI();
}
