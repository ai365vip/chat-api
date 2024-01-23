"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.browserCanvasModule = void 0;

const canvas_1 = require("./canvas"), context_1 = require("./context"), create_canvas_module_1 = require("../create-canvas-module");

exports.browserCanvasModule = (0, create_canvas_module_1.createModule)(canvas_1.BrowserCanvas, context_1.BrowserContext2d);
//# sourceMappingURL=modules.js.map
