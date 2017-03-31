"use strict";
exports.__esModule = true;
var builder_1 = require("../builder");
var Component = (function () {
    function Component(name) {
        /**
         * Exactly inner html that is used
         */
        this.jsxString = "Generic content for replacement";
        /**
         * Another components names
         */
        this.externalComponentsNames = [];
        this.codeLinesBeforeRenderReturn = [];
        this.isLayout = false;
        this.name = name;
    }
    Component.prototype.addExternalComponentName = function (name) {
        this.externalComponentsNames.push(name);
    };
    Component.prototype.makeLayout = function () {
        this.isLayout = true;
    };
    Component.prototype.processHTMLElement = function (el, componentTag, document) {
        var _this = this;
        el = el.cloneNode(true);
        var innerComponents = Array.from(el.querySelectorAll(componentTag));
        /**
         * For replacing component elements with JSX Components.
         * Like <comp name="Component"></comp> to <Component />
         */
        var replacements = [];
        innerComponents.forEach(function (componentEl) {
            var name = componentEl.getAttribute("name");
            if (_this.isLayout && componentEl.getAttribute("type") === builder_1.TYPE_LAYOUT_CONTENT) {
                // For now we omit this iteration, because we will replace comp with layout content later
                // Also, we remove everything from layout content for now
                var layoutContentReplacement = document.createElement("layout-content-replacement-" + Math.random() * 100000);
                componentEl.parentNode.replaceChild(layoutContentReplacement, componentEl);
            }
            if (!name) {
                return;
            }
            _this.addExternalComponentName(name);
            // Creating random name so we could change it in string further
            var customReplacementName = "repl-" + (Math.random() * 100000);
            replacements.push({
                element: "<" + customReplacementName + "></" + customReplacementName + ">",
                component: "<" + name + " />"
            });
            var componentNode = document.createElement(customReplacementName);
            componentEl.parentElement.replaceChild(componentNode, componentEl);
        }, this);
        var jsxString = el.innerHTML;
        replacements.forEach(function (r) {
            jsxString = jsxString.replace(r.element, r.component);
        });
        this.jsxString = jsxString;
    };
    Component.prototype.getName = function () {
        return this.name;
    };
    Component.prototype.generateCode = function () {
        var imports = "\nimport { h, Component } from \"preact\";";
        if (this.externalComponentsNames) {
            this.externalComponentsNames.forEach(function (module) {
                imports +=
                    "\nimport " + module + " from \"./" + module + "\";";
            });
        }
        var template = "\n" + imports + "\n\nexport default class " + this.name + " extends Component {\n  render() {\n    return (\n      <div>\n" + this.jsxString + "\n      </div>\n    )\n  }\n}\n    ";
        return template;
    };
    return Component;
}());
exports["default"] = Component;
