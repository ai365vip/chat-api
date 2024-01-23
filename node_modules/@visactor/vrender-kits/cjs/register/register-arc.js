"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerArc = exports._registerArc = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), arc_module_1 = require("../picker/contributions/canvas-picker/arc-module"), arc_module_2 = require("../picker/contributions/math-picker/arc-module");

function _registerArc() {
    _registerArc.__loaded || (_registerArc.__loaded = !0, (0, vrender_core_1.registerArcGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.arcModule), vrender_core_1.container.load(env_1.browser ? arc_module_1.arcCanvasPickModule : arc_module_2.arcMathPickModule));
}

exports._registerArc = _registerArc, _registerArc.__loaded = !1, exports.registerArc = _registerArc;
//# sourceMappingURL=register-arc.js.map