"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.glyphCanvasPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), glyph_picker_1 = require("./glyph-picker");

let loadGlyphPick = !1;

exports.glyphCanvasPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadGlyphPick || (loadGlyphPick = !0, bind(constants_1.CanvasGlyphPicker).to(glyph_picker_1.DefaultCanvasGlyphPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasGlyphPicker));
}));
//# sourceMappingURL=glyph-module.js.map
