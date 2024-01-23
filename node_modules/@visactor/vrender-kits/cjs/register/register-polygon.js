"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerPolygon = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), polygon_module_1 = require("../picker/contributions/canvas-picker/polygon-module"), polygon_module_2 = require("../picker/contributions/math-picker/polygon-module");

function _registerPolygon() {
    _registerPolygon.__loaded || (_registerPolygon.__loaded = !0, (0, vrender_core_1.registerPolygonGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.polygonModule), vrender_core_1.container.load(env_1.browser ? polygon_module_1.polygonCanvasPickModule : polygon_module_2.polygonMathPickModule));
}

_registerPolygon.__loaded = !1, exports.registerPolygon = _registerPolygon;
//# sourceMappingURL=register-polygon.js.map