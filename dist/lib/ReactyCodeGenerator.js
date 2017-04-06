"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var VirtualComponent_1 = require("./VirtualComponent");
var PreactLibrary = (function () {
    function PreactLibrary() {
    }
    PreactLibrary.prototype.getFactoryFunctionName = function () {
        return "h";
    };
    PreactLibrary.prototype.getName = function () {
        return "preact";
    };
    return PreactLibrary;
}());
var ReactLibrary = (function () {
    function ReactLibrary() {
    }
    ReactLibrary.prototype.getFactoryFunctionName = function () {
        return "React";
    };
    ReactLibrary.prototype.getName = function () {
        return "React";
    };
    return ReactLibrary;
}());
var JSX_ATTR_LIB = {
    "preact": PreactLibrary,
    "react": ReactLibrary
};
var DIALECT_ATTR_LIB = {
    "js": "js",
    "ts": "ts"
};
var CannotFindElementForComponentError = (function (_super) {
    __extends(CannotFindElementForComponentError, _super);
    function CannotFindElementForComponentError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CannotFindElementForComponentError;
}(Error));
var InvalidOptionsError = (function (_super) {
    __extends(InvalidOptionsError, _super);
    function InvalidOptionsError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidOptionsError;
}(Error));
var ComponentNotAttachedError = (function (_super) {
    __extends(ComponentNotAttachedError, _super);
    function ComponentNotAttachedError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ComponentNotAttachedError;
}(Error));
var ReactyCodeGenerator = (function () {
    function ReactyCodeGenerator() {
    }
    ReactyCodeGenerator.prototype.attachComponent = function (c) {
        this.component = c;
        var el = c.getEl();
        var jsxLibName = el.getAttribute(VirtualComponent_1.ATTR_JSX_LIB);
        if (jsxLibName) {
            if (!JSX_ATTR_LIB[jsxLibName]) {
                throw new InvalidOptionsError("Element specified " + jsxLibName + " in attribute " + VirtualComponent_1.ATTR_JSX_LIB + ", but it was not valid.\nValid options are: " + Object.keys(JSX_ATTR_LIB));
            }
            this.library = new JSX_ATTR_LIB[jsxLibName]();
        }
        else {
            // This is the default
            this.library = new PreactLibrary();
        }
    };
    ReactyCodeGenerator.prototype.generate = function () {
        var component = this.component;
        if (!component) {
            throw new ComponentNotAttachedError();
        }
        var componentsUsages = [];
        var additionalImports = "";
        // We will be first replacing nodes with ids of children with our special nodes,
        // also saving component names so we will use them instead. From <some-id-123></some-id-123>
        // to <Component />
        var replacements = [];
        var el = component.getEl();
        component.getChildren().forEach(function gatheringImportAndReplacingElement(c) {
            additionalImports += "\nimport " + c.getName() + " from \"./" + c.getName() + "\"";
            var componentElement = el.querySelector("[" + VirtualComponent_1.ATTR_ID + "=\"" + c.getId() + "\"]");
            if (!componentElement) {
                throw new CannotFindElementForComponentError("Was trying to find element with " + VirtualComponent_1.ATTR_ID + "=" + c.getId() + " from component " + c.getName() + ". Could not find.");
            }
            var fakeReplacementTagName = this.createFakeReplacementTagName();
            // Replacing this element with fake, which will be then replaced in string
            componentElement.parentElement.replaceChild(el.ownerDocument.createElement(fakeReplacementTagName), componentElement);
            // Creating replacements for fututre components
            replacements.push({
                search: "<" + fakeReplacementTagName + "></" + fakeReplacementTagName + ">",
                replace: "<" + c.getName() + " />"
            });
        }, this);
        var jsx = el.outerHTML;
        replacements.forEach(function (r) {
            jsx = jsx.replace(r.search, r.replace);
        });
        return "\nimport { " + this.library.getFactoryFunctionName() + ", Component } from " + this.library.getName() + ";" + additionalImports + "\n\nexport default class " + component.getName() + " extends Component {\n  render() {\n    return (\n      " + jsx + "\n    );\n  }\n}\n";
    };
    ReactyCodeGenerator.prototype.createFakeReplacementTagName = function () {
        return String("component-" + Math.ceil(Math.random() * 100000));
    };
    return ReactyCodeGenerator;
}());
exports["default"] = ReactyCodeGenerator;
