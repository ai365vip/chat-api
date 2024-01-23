"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pyramid3dCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), pyramid3d_picker_1 = require("./pyramid3d-picker");

let loadPyramid3dPick = !1;

exports.pyramid3dCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPyramid3dPick || (loadPyramid3dPick = !0, bind(constants_1.CanvasPyramid3dPicker).to(pyramid3d_picker_1.DefaultCanvasPyramid3dPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasPyramid3dPicker));
}));
//# sourceMappingURL=pyramid3d-module.js.map
