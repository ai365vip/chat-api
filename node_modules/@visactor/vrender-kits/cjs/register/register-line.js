"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerLine = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), line_module_1 = require("../picker/contributions/canvas-picker/line-module"), line_module_2 = require("../picker/contributions/math-picker/line-module");

function _registerLine() {
    _registerLine.__loaded || (_registerLine.__loaded = !0, (0, vrender_core_1.registerLineGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.lineModule), vrender_core_1.container.load(env_1.browser ? line_module_1.lineCanvasPickModule : line_module_2.lineMathPickModule));
}

_registerLine.__loaded = !1, exports.registerLine = _registerLine;
//# sourceMappingURL=register-line.js.map