"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.textMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), text_picker_1 = require("./text-picker");

let loadTextPick = !1;

exports.textMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadTextPick || (loadTextPick = !0, bind(constants_1.MathTextPicker).to(text_picker_1.DefaultMathTextPicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathTextPicker));
}));
//# sourceMappingURL=text-module.js.map
