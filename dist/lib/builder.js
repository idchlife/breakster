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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var FileSaver_1 = require("./FileSaver");
var fs = require("async-file");
var jsdom = require("jsdom");
var VirtualComponent_1 = require("./VirtualComponent");
var CodeGenerator_1 = require("./CodeGenerator");
var BuilderError = (function (_super) {
    __extends(BuilderError, _super);
    function BuilderError(message) {
        return _super.call(this, "[project-builder]: " + message) || this;
    }
    return BuilderError;
}(Error));
exports.TYPE_LAYOUT = "layout";
exports.TYPE_LAYOUT_CONTENT = "layout-content";
var ALLOWED_LANGUAGES = [
    "javascript",
    "typescript"
];
var FILE_EXTENSIONS = (_a = {},
    _a[ALLOWED_LANGUAGES[0]] = "jsx",
    _a[ALLOWED_LANGUAGES[0]] = "tsx",
    _a);
var Builder = (function () {
    function Builder(inputFile, outputFolder, debug) {
        if (debug === void 0) { debug = true; }
        this.debug = false;
        if (!inputFile || !outputFolder) {
            throw new BuilderError("You must pass inputFile and outputFolder in Builder constructor");
        }
        this.inputFile = inputFile;
        this.outputFolder = outputFolder;
        this.debug = debug;
    }
    Builder.prototype.setLanguage = function (lang) {
        if (!ALLOWED_LANGUAGES.find(function (l) { return l === lang; })) {
            throw new BuilderError("Language " + lang + " is not supported");
        }
    };
    Builder.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var fileContents, window, document, rootComponentElement, codeGenerator, rootComponent, components, fileSaver_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkPrerequisites()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs.readFile(this.inputFile, {
                                encoding: "utf8"
                            })];
                    case 2:
                        fileContents = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                jsdom.env(fileContents, {
                                    done: function (error, window) {
                                        if (error) {
                                            console.error(error);
                                        }
                                        else {
                                            resolve(window);
                                        }
                                    }
                                });
                            })];
                    case 3:
                        window = _a.sent();
                        document = window.document;
                        rootComponentElement = document.body.querySelector("[" + VirtualComponent_1.DEFAULT_COMPONENT_ATTR_NAME + "]");
                        if (!rootComponentElement) {
                            throw new BuilderError("Could not find single element suited for component creation. Check your html.");
                        }
                        codeGenerator = new CodeGenerator_1.ReactyCodeGenerator();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        rootComponent = new VirtualComponent_1["default"](rootComponentElement, VirtualComponent_1.DEFAULT_COMPONENT_ATTR_NAME);
                        components = rootComponent.collectAllSubChildrenAndItself();
                        fileSaver_1 = new FileSaver_1.ComponentFileSaver();
                        return [4 /*yield*/, components.forEach(function (c) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, fileSaver_1.save(this.outputFolder, c.getCodeGenerator())];
                            }); }); })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        console.error(e_1);
                        throw new BuilderError("There was an error while build process was active. Above - more info on error.");
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Builder.prototype.checkPrerequisites = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.stat(this.inputFile)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        throw new BuilderError("File " + this.inputFile + " does not exist or not available for read");
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, fs.stat(this.outputFolder)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_3 = _a.sent();
                        throw new BuilderError("Folder " + this.outputFolder + " is not available for writing or does not exist");
                    case 6: return [2 /*return*/, true];
                }
            });
        });
    };
    return Builder;
}());
exports["default"] = Builder;
var _a;
