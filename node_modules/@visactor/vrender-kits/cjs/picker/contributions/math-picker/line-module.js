"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.lineMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), line_picker_1 = require("./line-picker");

let loadLinePick = !1;

exports.lineMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadLinePick || (loadLinePick = !0, bind(constants_1.MathLinePicker).to(line_picker_1.DefaultMathLinePicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathLinePicker));
}));
//# sourceMappingURL=line-module.js.map
