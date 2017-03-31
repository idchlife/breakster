"use strict";
exports.__esModule = true;
var builder_1 = require("../builder");
var Component = (function () {
    function Component(name) {
        /**
         * Exactly inner html that is used
         */
        this.jsxString = "Generic content for replacement";
        this.jsxHasSingleNode = "";
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
        el = this.removeEverythingFromLayoutsExceptContent(el);
        // If this component is layout we should also do some different processing
        if (el.getAttribute("type") === builder_1.TYPE_LAYOUT) {
            this.isLayout = true;
            // Before processing all component we should clear layout-content, so inner
            // components wonts be used in imports
            var layoutContentEl = el.querySelector("[type=\"" + builder_1.TYPE_LAYOUT_CONTENT + "\"]");
            if (layoutContentEl) {
                layoutContentEl.parentNode.replaceChild(layoutContentEl.cloneNode(), layoutContentEl);
            }
        }
        /**
         * For replacing component elements with JSX Components.
         * Like <comp name="Component"></comp> to <Component />
         */
        var replacements = [];
        // First we replacing all type="layout" components.
        var innerComponents = Array.from(el.querySelectorAll(componentTag));
        innerComponents.forEach(function (componentEl) {
            // console.log(`Inside component ${this.name} working with component ${componentEl.getAttribute("name")}`);
            var name = componentEl.getAttribute("name");
            // When this component itself is layout and there is layout-content inside
            if (_this.isLayout && componentEl.getAttribute("type") === builder_1.TYPE_LAYOUT_CONTENT) {
                // For now we omit this iteration, because we will replace comp with layout content later
                // Also, we remove everything from layout content for now
                var layoutReplacementNodeName = "layout-content-replacement-" + Math.random() * 100000;
                var layoutContentReplacement = document.createElement(layoutReplacementNodeName);
                componentEl.parentNode.replaceChild(layoutContentReplacement, componentEl);
                // layout-content code is different from other code, because it uses props.children inside,
                // that's it. And DOM element simply dissapears
                replacements.push({
                    element: "<" + layoutReplacementNodeName + "></" + layoutReplacementNodeName + ">",
                    component: "{props.children}"
                });
                return;
            }
            if (!name) {
                return;
            }
            // We need to import this component
            _this.addExternalComponentName(name);
            // Creating random name so we could change it in string further
            var customReplacementName = "repl-" + (Math.random() * 100000);
            var customReplacementNameTag = "<" + customReplacementName + "></" + customReplacementName + ">";
            // When we're dealing with layout inside of this component we should wrap content inside layout
            // in layout component. Basicalle prepend and append
            if (componentEl.getAttribute("type") === builder_1.TYPE_LAYOUT) {
                // We need custom replacement for Layout
                replacements.push({
                    element: "<" + customReplacementName + ">",
                    component: "\n<" + name + ">\n          "
                });
                replacements.push({
                    element: "</" + customReplacementName + ">",
                    component: "\n</" + name + ">\n          "
                });
            }
            else {
                // Dealing with simple component
                replacements.push({
                    element: customReplacementNameTag,
                    component: "<" + name + " />"
                });
            }
            var componentNode = document.createElement(customReplacementName);
            // If this is Layout element we also should append all children
            if (componentEl.getAttribute("type") === builder_1.TYPE_LAYOUT) {
                Array.from(componentEl.childNodes).forEach(function (n) { return componentNode.appendChild(n); });
            }
            componentEl.parentElement.replaceChild(componentNode, componentEl);
        }, this);
        var jsxString = el.innerHTML;
        // Replacing every component
        replacements.forEach(function (r) {
            jsxString = jsxString.replace(r.element, r.component);
        });
        // Removing new lines from beginning and ending of string
        this.jsxString = jsxString.replace(/^\s+|\s+$/g, "");
        ;
    };
    /**
     * This method strips everything from the layout so it will have only content to wrap,
     * no insides of exactly layout (insides will be in layout component)
     */
    Component.prototype.removeEverythingFromLayoutsExceptContent = function (el) {
        // Finding layouts
        var layoutsEls = Array.from(el.querySelectorAll("[type=\"" + builder_1.TYPE_LAYOUT + "\"]"));
        layoutsEls.forEach(function (layoutEl) {
            // If there is no content, simply omitting it
            var contentEl = layoutEl.querySelector("[type=\"" + builder_1.TYPE_LAYOUT_CONTENT + "\"]");
            if (!contentEl) {
                return;
            }
            contentEl = contentEl.cloneNode(true);
            // Removing everything
            Array.from(layoutEl.childNodes).forEach(function (n) { return n.parentElement.removeChild(n); });
            // And now inserting just content
            Array.from(contentEl.childNodes).forEach(function (n) { return layoutEl.appendChild(n); });
        });
        return el;
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
        var template = "\n" + imports + "\n\nexport default class " + this.name + " extends Component {\n  render() {\n    return (\n      <div>\n        " + this.jsxString + "\n      </div>\n    )\n  }\n}\n    ";
        return template;
    };
    return Component;
}());
exports["default"] = Component;
