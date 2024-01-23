"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.rectMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), rect_picker_1 = require("./rect-picker");

let loadRectPick = !1;

exports.rectMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRectPick || (loadRectPick = !0, bind(constants_1.MathRectPicker).to(rect_picker_1.DefaultMathRectPicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathRectPicker));
}));
//# sourceMappingURL=rect-module.js.map
