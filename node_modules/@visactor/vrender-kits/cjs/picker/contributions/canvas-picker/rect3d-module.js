"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.rect3dCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), rect3d_picker_1 = require("./rect3d-picker");

let loadRect3dPick = !1;

exports.rect3dCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRect3dPick || (loadRect3dPick = !0, bind(constants_1.CanvasRect3dPicker).to(rect3d_picker_1.DefaultCanvasRect3dPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasRect3dPicker));
}));
//# sourceMappingURL=rect3d-module.js.map
