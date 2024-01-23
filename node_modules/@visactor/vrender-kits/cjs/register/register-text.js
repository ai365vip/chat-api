"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerText = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), text_module_1 = require("../picker/contributions/canvas-picker/text-module"), text_module_2 = require("../picker/contributions/math-picker/text-module");

function _registerText() {
    _registerText.__loaded || (_registerText.__loaded = !0, (0, vrender_core_1.registerTextGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.textModule), vrender_core_1.container.load(env_1.browser ? text_module_1.textCanvasPickModule : text_module_2.textMathPickModule));
}

_registerText.__loaded = !1, exports.registerText = _registerText;
//# sourceMappingURL=register-text.js.map