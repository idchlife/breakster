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
var ReactyCodeGenerator_1 = require("./ReactyCodeGenerator");
var VirtualComponentParsingError = (function (_super) {
    __extends(VirtualComponentParsingError, _super);
    function VirtualComponentParsingError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VirtualComponentParsingError;
}(Error));
var VirtualComponentInvalidElementError = (function (_super) {
    __extends(VirtualComponentInvalidElementError, _super);
    function VirtualComponentInvalidElementError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VirtualComponentInvalidElementError;
}(Error));
;
var VirtualComponentInitializationError = (function (_super) {
    __extends(VirtualComponentInitializationError, _super);
    function VirtualComponentInitializationError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VirtualComponentInitializationError;
}(Error));
;
var ATTR_NAME = "j-name";
exports.ATTR_ID = "j-id";
exports.DEFAULT_COMPONENT_ATTR_NAME = "j-comp";
exports.ATTR_DIALECT = "j-dialect";
exports.ATTR_JSX_LIB = "j-jsx-lib";
var VirtualComponent = (function () {
    function VirtualComponent(el, componentAttr, codeGenerator) {
        if (codeGenerator === void 0) { codeGenerator = new ReactyCodeGenerator_1["default"](); }
        // Innter components
        this.children = [];
        if (!componentAttr) {
            throw new VirtualComponentInitializationError("Required argument componentAttr was not provided.");
        }
        if (!codeGenerator) {
            throw new VirtualComponentInitializationError("Required argument codeGenerator was not provided.");
        }
        this.validateRootElement(el);
        this.el = el;
        this.name = el.getAttribute(ATTR_NAME);
        this.componentAttr = componentAttr;
        this.codeGenerator = codeGenerator;
        this.codeGenerator.attachComponent(this);
        this.parseRootHTMLElement();
    }
    VirtualComponent.prototype.setCodeGenerator = function (cg) {
        this.codeGenerator = cg;
        return this;
    };
    VirtualComponent.prototype.getName = function () {
        return this.name;
    };
    VirtualComponent.prototype.getEl = function () {
        return this.el;
    };
    VirtualComponent.prototype.getComponentAttr = function () {
        return this.componentAttr;
    };
    VirtualComponent.prototype.getChildren = function () {
        return this.children;
    };
    VirtualComponent.prototype.setId = function (id) {
        this.id = id;
        return this;
    };
    VirtualComponent.prototype.getId = function () {
        return this.id;
    };
    VirtualComponent.prototype.generateCode = function () {
        return this.codeGenerator.generate();
    };
    VirtualComponent.prototype.getAllChildComponentsAndItself = function () {
        var arr = [this];
        this.children.forEach(function (c) { return arr = arr.concat(c.getAllChildComponentsAndItself()); });
        return arr;
    };
    VirtualComponent.prototype.validateRootElement = function (el) {
        if (!el) {
            throw new VirtualComponentInvalidElementError("Element does not appear to be valid. Type of this element: " + typeof el);
        }
        if (!el.getAttribute(ATTR_NAME)) {
            throw new VirtualComponentParsingError("Component does not have attr " + ATTR_NAME + " or attribute has empty value!\n\n" + ATTR_NAME + " value: " + el.getAttribute(ATTR_NAME) + "\n\nAttributes: " + el.attributes + "\n\nHtml of this element (without children): " + el.cloneNode().outerHTML + "\n");
        }
    };
    VirtualComponent.prototype.parseRootHTMLElement = function () {
        try {
            var currentEl = this.el;
            // Elements which is going to be root for inner components
            var discoveredComponentRoots_1 = [];
            if (currentEl.childNodes) {
                var arr = Array.from(currentEl.childNodes).filter(function (el) { return el.nodeType === 1; });
                // Filling with elements. Also filtered above by nodeType === 1 so
                // we will be working only with element nodes, not text/comment etc
                arr.forEach(function parseChildNode(el) {
                    // If child itself is component root
                    if (el.getAttribute(ATTR_NAME)) {
                        discoveredComponentRoots_1.push(el);
                        return;
                    }
                    // Finding first occurence of element in children of this child
                    var foundElement = el.querySelector("[" + this.componentAttr + "]");
                    if (foundElement) {
                        discoveredComponentRoots_1.push(foundElement);
                    }
                }, this);
            }
            // Creating inner elements
            discoveredComponentRoots_1.forEach(function creatingComponent(el) {
                var id = this.generateUniqueId();
                el.setAttribute(exports.ATTR_ID, id);
                this.children.push(new VirtualComponent(el.cloneNode(true), this.componentAttr, new ReactyCodeGenerator_1["default"]()).setId(id));
            }, this);
        }
        catch (e) {
            console.error(e);
            throw new VirtualComponentParsingError("Error occured while parsing element in VirtualComponent named " + this.getName() + ". More info above this error.");
        }
    };
    VirtualComponent.prototype.generateUniqueId = function () {
        return String(Math.ceil(Math.random() * 100000));
    };
    return VirtualComponent;
}());
exports["default"] = VirtualComponent;
