"use strict";
exports.__esModule = true;
var Component = (function () {
    function Component(name) {
        this.externalComponents = [];
    }
    Component.prototype.getName = function () {
        return this.name;
    };
    Component.prototype.generateCode = function () {
        var name = "";
        var returnJSX = "";
        var template = "\nimport { h, Component } from \"preact\";\n\nexport default class " + name + " extends Component {\n  render() {\n    return (\n      <div>\n        " + returnJSX + "\n      </div>\n    )\n  }\n}\n    ";
        return template;
    };
    return Component;
}());
exports["default"] = Component;
