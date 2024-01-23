"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.nodeCanvasModule = void 0;

const canvas_1 = require("./canvas"), context_1 = require("./context"), create_canvas_module_1 = require("../create-canvas-module");

exports.nodeCanvasModule = (0, create_canvas_module_1.createModule)(canvas_1.NodeCanvas, context_1.NodeContext2d);
//# sourceMappingURL=modules.js.map
