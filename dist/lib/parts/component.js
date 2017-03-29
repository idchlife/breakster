"use strict";
exports.__esModule = true;
var Component = (function () {
    function Component(name) {
        /**
         * Exactly inner html that is used
         */
        this.content = "Generic content for replacement";
        /**
         * Another components names
         */
        this.localImports = [];
        this.name = name;
    }
    Component.prototype.addExternalComponentName = function (name) {
        this.localImports.push(name);
    };
    Component.prototype.setContent = function (content) {
        this.content = content;
    };
    Component.prototype.getName = function () {
        return this.name;
    };
    Component.prototype.generateCode = function () {
        var imports = "\nimport { h, Component } from \"preact\";";
        if (this.localImports) {
            this.localImports.forEach(function (module) {
                imports +=
                    "\nimport " + module + " from \"./" + module + "\";";
            });
        }
        var template = "\n" + imports + "\n\nexport default class " + this.name + " extends Component {\n  render() {\n    return (\n      <div>\n" + this.content + "\n      </div>\n    )\n  }\n}\n    ";
        return template;
    };
    return Component;
}());
exports["default"] = Component;
