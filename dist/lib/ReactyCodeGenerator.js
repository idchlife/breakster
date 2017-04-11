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
var STRIP_DEFAULT_ATTRIBUTES = [
    VirtualComponent_1.ATTR_NAME,
    VirtualComponent_1.ATTR_ID,
    VirtualComponent_1.ATTR_DIALECT,
    VirtualComponent_1.ATTR_JSX_LIB,
    VirtualComponent_1.DEFAULT_COMPONENT_ATTR_NAME
];
console.log('Debug: got from early import', STRIP_DEFAULT_ATTRIBUTES);
var ReactyLibrary = (function () {
    function ReactyLibrary() {
        // Default dialect is JavaScript
        this.dialect = new JavaScript();
    }
    ReactyLibrary.prototype.getFactoryFunctionName = function () { return ""; };
    ReactyLibrary.prototype.getName = function () { return ""; };
    ReactyLibrary.prototype.getRenderArguments = function () { return ""; };
    ReactyLibrary.prototype.getGenericAfterExtend = function () {
        if (this.dialect instanceof TypeScript) {
            return "<Props, State>";
        }
        return "";
    };
    ReactyLibrary.prototype.getBeforeRenderReturnCode = function () { return ""; };
    ReactyLibrary.prototype.getAdditionalImports = function () { return ""; };
    ReactyLibrary.prototype.getComponentProperties = function () { return ""; };
    ReactyLibrary.prototype.getBeforComponentDeclarationCode = function () {
        if (this.dialect instanceof TypeScript) {
            return "\ninterface Props {}\ninterface State {}\n";
        }
        return "";
    };
    ;
    ReactyLibrary.prototype.provideDialect = function (d) {
        this.dialect = d;
    };
    ReactyLibrary.prototype.getDialect = function () {
        return this.dialect;
    };
    return ReactyLibrary;
}());
var PreactLibrary = (function (_super) {
    __extends(PreactLibrary, _super);
    function PreactLibrary(c) {
        var _this = _super.call(this) || this;
        _this.component = c;
        return _this;
    }
    PreactLibrary.prototype.getFactoryFunctionName = function () {
        return "h";
    };
    PreactLibrary.prototype.getName = function () {
        return "preact";
    };
    PreactLibrary.prototype.getRenderArguments = function () {
        return "props, state";
    };
    return PreactLibrary;
}(ReactyLibrary));
var ReactLibrary = (function (_super) {
    __extends(ReactLibrary, _super);
    function ReactLibrary() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactLibrary.prototype.getFactoryFunctionName = function () {
        return "React";
    };
    ReactLibrary.prototype.getName = function () {
        return "React";
    };
    return ReactLibrary;
}(ReactyLibrary));
var Dialect = (function () {
    function Dialect() {
    }
    Dialect.prototype.getFileExtension = function () {
        return "jsx";
    };
    Dialect.getAttrValue = function () {
        // This is default value
        return "";
    };
    return Dialect;
}());
var JavaScript = (function (_super) {
    __extends(JavaScript, _super);
    function JavaScript() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JavaScript.getAttrValue = function () {
        return "javascript";
    };
    return JavaScript;
}(Dialect));
var TypeScript = (function (_super) {
    __extends(TypeScript, _super);
    function TypeScript() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypeScript.prototype.getFileExtension = function () {
        return "tsx";
    };
    TypeScript.getAttrValue = function () {
        return "typescript";
    };
    return TypeScript;
}(Dialect));
var JSX_ATTR_LIB = {
    "preact": PreactLibrary,
    "react": ReactLibrary
};
var DIALECT_ATTR_LIB = (_a = {},
    _a[JavaScript.getAttrValue()] = JavaScript,
    _a[TypeScript.getAttrValue()] = TypeScript,
    _a);
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
var ComponentWasNotYetParserError = (function (_super) {
    __extends(ComponentWasNotYetParserError, _super);
    function ComponentWasNotYetParserError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ComponentWasNotYetParserError;
}(Error));
var ReactyCodeGenerator = (function () {
    function ReactyCodeGenerator() {
        this.componentProcessed = false;
    }
    ReactyCodeGenerator.prototype.attachComponent = function (c) {
        this.component = c;
    };
    ReactyCodeGenerator.prototype.processComponent = function () {
        var c = this.component;
        var el = c.getEl();
        var dialectAttrValue = c.findAttributeValueThrouItselfAndParents(VirtualComponent_1.ATTR_DIALECT);
        // Trying to find dialect from parent components
        var dialect;
        if (dialectAttrValue) {
            if (!DIALECT_ATTR_LIB[dialectAttrValue]) {
                throw new InvalidOptionsError("Invalid dialect via " + VirtualComponent_1.ATTR_DIALECT + " attribute, allowed dialects: " + Object.keys(DIALECT_ATTR_LIB));
            }
            dialect = new DIALECT_ATTR_LIB[dialectAttrValue]();
        }
        else {
            dialect = new JavaScript();
        }
        var jsxLibName = el.getAttribute(VirtualComponent_1.ATTR_JSX_LIB);
        if (jsxLibName) {
            if (!JSX_ATTR_LIB[jsxLibName]) {
                throw new InvalidOptionsError("Element specified " + jsxLibName + " in attribute " + VirtualComponent_1.ATTR_JSX_LIB + ", but it was not valid.\nValid options are: " + Object.keys(JSX_ATTR_LIB));
            }
            this.library = new JSX_ATTR_LIB[jsxLibName]();
        }
        else {
            // This is the default
            this.library = new PreactLibrary(c);
        }
        if (this.library.provideDialect) {
            this.library.provideDialect(dialect);
        }
        this.componentProcessed = true;
    };
    ReactyCodeGenerator.prototype.generate = function () {
        if (!this.componentProcessed) {
            this.processComponent();
        }
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
        // Before making changes to element we clone it, so other children/parent
        // elements wont be affected by changed element
        el = el.cloneNode(true);
        var defaultAttrsToStrip = [
            VirtualComponent_1.ATTR_NAME,
            VirtualComponent_1.ATTR_ID,
            VirtualComponent_1.ATTR_DIALECT,
            VirtualComponent_1.ATTR_JSX_LIB,
            VirtualComponent_1.DEFAULT_COMPONENT_ATTR_NAME
        ];
        // Stripping default attributes
        defaultAttrsToStrip.forEach(function (attr) {
            el.removeAttribute(attr);
        });
        var jsx = el.outerHTML;
        replacements.forEach(function (r) {
            jsx = jsx.replace(r.search, r.replace);
        });
        var l = this.library;
        return "\nimport { " + this.library.getFactoryFunctionName() + ", Component } from \"" + this.library.getName() + "\";" + additionalImports + "\n\n" + l.getBeforComponentDeclarationCode() + "\n\nexport default class " + component.getName() + " extends Component" + l.getGenericAfterExtend() + " {\n  render(" + l.getRenderArguments() + ") {\n    " + l.getBeforeRenderReturnCode() + "\n    return (\n      " + jsx + "\n    );\n  }\n}\n";
    };
    ReactyCodeGenerator.prototype.getComponent = function () {
        return this.component;
    };
    ReactyCodeGenerator.prototype.getFileExtension = function () {
        if (!this.componentProcessed) {
            this.processComponent();
        }
        return this.library.getDialect().getFileExtension();
    };
    ReactyCodeGenerator.prototype.createFakeReplacementTagName = function () {
        return String("component-" + Math.ceil(Math.random() * 100000));
    };
    return ReactyCodeGenerator;
}());
exports["default"] = ReactyCodeGenerator;
var _a;
