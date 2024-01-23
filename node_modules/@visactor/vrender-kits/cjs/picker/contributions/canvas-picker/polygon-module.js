"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.polygonCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), polygon_picker_1 = require("./polygon-picker");

let loadPolygonPick = !1;

exports.polygonCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPolygonPick || (loadPolygonPick = !0, bind(constants_1.CanvasPolygonPicker).to(polygon_picker_1.DefaultCanvasPolygonPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasPolygonPicker));
}));
//# sourceMappingURL=polygon-module.js.map
