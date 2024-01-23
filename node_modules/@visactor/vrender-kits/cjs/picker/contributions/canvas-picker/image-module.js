"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.imageCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), image_picker_1 = require("./image-picker");

let loadImagePick = !1;

exports.imageCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadImagePick || (loadImagePick = !0, bind(constants_1.CanvasImagePicker).to(image_picker_1.DefaultCanvasImagePicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasImagePicker));
}));
//# sourceMappingURL=image-module.js.map
