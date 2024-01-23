"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.arcCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), arc_picker_1 = require("./arc-picker"), constants_1 = require("../constants");

let loadArcPick = !1;

exports.arcCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadArcPick || (loadArcPick = !0, bind(constants_1.CanvasArcPicker).to(arc_picker_1.DefaultCanvasArcPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasArcPicker));
}));
//# sourceMappingURL=arc-module.js.map
