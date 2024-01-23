"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerRect3d = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), rect3d_module_1 = require("../picker/contributions/canvas-picker/rect3d-module");

function _registerRect3d() {
    _registerRect3d.__loaded || (_registerRect3d.__loaded = !0, (0, vrender_core_1.registerRect3dGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.rect3dModule), vrender_core_1.container.load((env_1.browser, 
    rect3d_module_1.rect3dCanvasPickModule)));
}

_registerRect3d.__loaded = !1, exports.registerRect3d = _registerRect3d;
//# sourceMappingURL=register-rect3d.js.map