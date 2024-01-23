"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerCircle = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), circle_module_1 = require("../picker/contributions/canvas-picker/circle-module"), circle_module_2 = require("../picker/contributions/math-picker/circle-module");

function _registerCircle() {
    _registerCircle.__loaded || (_registerCircle.__loaded = !0, (0, vrender_core_1.registerCircleGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.circleModule), vrender_core_1.container.load(env_1.browser ? circle_module_1.circleCanvasPickModule : circle_module_2.circleMathPickModule));
}

_registerCircle.__loaded = !1, exports.registerCircle = _registerCircle;
//# sourceMappingURL=register-circle.js.map