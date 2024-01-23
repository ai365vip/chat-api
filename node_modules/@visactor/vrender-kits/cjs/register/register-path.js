"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerPath = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), path_module_1 = require("../picker/contributions/canvas-picker/path-module"), path_module_2 = require("../picker/contributions/math-picker/path-module");

function _registerPath() {
    _registerPath.__loaded || (_registerPath.__loaded = !0, (0, vrender_core_1.registerPathGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.pathModule), vrender_core_1.container.load(env_1.browser ? path_module_1.pathCanvasPickModule : path_module_2.pathMathPickModule));
}

_registerPath.__loaded = !1, exports.registerPath = _registerPath;
//# sourceMappingURL=register-path.js.map