"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.circleMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), circle_picker_1 = require("./circle-picker");

let loadCirclePick = !1;

exports.circleMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadCirclePick || (loadCirclePick = !0, bind(constants_1.MathCirclePicker).to(circle_picker_1.DefaultMathCirclePicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathCirclePicker));
}));
//# sourceMappingURL=circle-module.js.map
