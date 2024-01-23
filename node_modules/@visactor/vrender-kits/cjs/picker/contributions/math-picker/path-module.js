"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pathMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), path_picker_1 = require("./path-picker");

let loadPathPick = !1;

exports.pathMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPathPick || (loadPathPick = !0, bind(constants_1.MathPathPicker).to(path_picker_1.DefaultMathPathPicker).inSingletonScope(), 
    bind(constants_1.MathPickerContribution).toService(constants_1.MathPathPicker));
}));
//# sourceMappingURL=path-module.js.map
