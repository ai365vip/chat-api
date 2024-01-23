"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pathCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), path_picker_1 = require("./path-picker");

let loadPathPick = !1;

exports.pathCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPathPick || (loadPathPick = !0, bind(constants_1.CanvasPathPicker).to(path_picker_1.DefaultCanvasPathPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasPathPicker));
}));
//# sourceMappingURL=path-module.js.map
