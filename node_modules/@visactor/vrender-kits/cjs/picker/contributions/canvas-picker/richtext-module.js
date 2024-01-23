"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.richtextCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), richtext_picker_1 = require("./richtext-picker");

let loadRichtextPick = !1;

exports.richtextCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRichtextPick || (loadRichtextPick = !0, bind(constants_1.CanvasRichTextPicker).to(richtext_picker_1.DefaultCanvasRichTextPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasRichTextPicker));
}));
//# sourceMappingURL=richtext-module.js.map
