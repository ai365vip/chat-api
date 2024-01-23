"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadDataZoomComponent = void 0;

const vrender_kits_1 = require("@visactor/vrender-kits"), register_1 = require("../tag/register");

function loadDataZoomComponent() {
    (0, register_1.loadTagComponent)(), (0, vrender_kits_1.registerRect)(), (0, vrender_kits_1.registerSymbol)(), 
    (0, vrender_kits_1.registerArea)(), (0, vrender_kits_1.registerLine)();
}

exports.loadDataZoomComponent = loadDataZoomComponent;
//# sourceMappingURL=register.js.map