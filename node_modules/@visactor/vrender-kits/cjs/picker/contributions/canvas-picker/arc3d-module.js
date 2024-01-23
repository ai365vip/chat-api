"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.arc3dCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), arc3d_picker_1 = require("./arc3d-picker");

let loadArc3dPick = !1;

exports.arc3dCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadArc3dPick || (loadArc3dPick = !0, bind(constants_1.CanvasArc3dPicker).to(arc3d_picker_1.DefaultCanvasArc3dPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasArc3dPicker));
}));
//# sourceMappingURL=arc3d-module.js.map
