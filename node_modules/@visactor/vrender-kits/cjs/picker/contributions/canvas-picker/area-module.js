"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.areaCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), area_picker_1 = require("./area-picker");

let loadAreaPick = !1;

exports.areaCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadAreaPick || (loadAreaPick = !0, bind(constants_1.CanvasAreaPicker).to(area_picker_1.DefaultCanvasAreaPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasAreaPicker));
}));
//# sourceMappingURL=area-module.js.map
