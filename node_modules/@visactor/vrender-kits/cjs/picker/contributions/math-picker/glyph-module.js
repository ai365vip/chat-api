"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.glyphMathPickModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), glyph_picker_1 = require("./glyph-picker");

let loadGlyphPick = !1;

exports.glyphMathPickModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    loadGlyphPick || (loadGlyphPick = !0, bind(constants_1.MathGlyphPicker).to(glyph_picker_1.DefaultMathGlyphPicker).inSingletonScope(), 
    bind(glyph_picker_1.DefaultMathGlyphPicker).toService(constants_1.MathGlyphPicker));
}));
//# sourceMappingURL=glyph-module.js.map
