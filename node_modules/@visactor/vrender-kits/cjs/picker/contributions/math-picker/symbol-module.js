"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.symbolMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), symbol_picker_1 = require("./symbol-picker");

let loadSymbolPick = !1;

exports.symbolMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadSymbolPick || (loadSymbolPick = !0, bind(constants_1.MathSymbolPicker).to(symbol_picker_1.DefaultMathSymbolPicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathSymbolPicker));
}));
//# sourceMappingURL=symbol-module.js.map
