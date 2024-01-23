"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.rectCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), rect_picker_1 = require("./rect-picker");

let loadRectPick = !1;

exports.rectCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRectPick || (loadRectPick = !0, bind(constants_1.CanvasRectPicker).to(rect_picker_1.DefaultCanvasRectPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasRectPicker));
}));
//# sourceMappingURL=rect-module.js.map
