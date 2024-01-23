"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.arcMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), arc_picker_1 = require("./arc-picker"), constants_1 = require("../constants");

let loadArcPick = !1;

exports.arcMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadArcPick || (loadArcPick = !0, bind(constants_1.MathArcPicker).to(arc_picker_1.DefaultMathArcPicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathArcPicker));
}));
//# sourceMappingURL=arc-module.js.map
