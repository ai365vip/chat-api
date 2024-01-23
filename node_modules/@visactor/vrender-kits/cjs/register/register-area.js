"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerArea = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), area_module_1 = require("../picker/contributions/canvas-picker/area-module"), area_module_2 = require("../picker/contributions/math-picker/area-module");

function _registerArea() {
    _registerArea.__loaded || (_registerArea.__loaded = !0, (0, vrender_core_1.registerAreaGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.areaModule), vrender_core_1.container.load(env_1.browser ? area_module_1.areaCanvasPickModule : area_module_2.areaMathPickModule));
}

_registerArea.__loaded = !1, exports.registerArea = _registerArea;
//# sourceMappingURL=register-area.js.map