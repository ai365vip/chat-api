"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.imageMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), image_picker_1 = require("./image-picker");

let loadImagePick = !1;

exports.imageMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadImagePick || (loadImagePick = !0, bind(constants_1.MathImagePicker).to(image_picker_1.DefaultMathImagePicker).inSingletonScope(), 
    bind(image_picker_1.DefaultMathImagePicker).toService(constants_1.MathImagePicker));
}));
//# sourceMappingURL=image-module.js.map
