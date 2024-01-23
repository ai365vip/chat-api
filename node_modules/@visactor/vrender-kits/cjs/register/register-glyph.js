"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGlyph = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), glyph_module_1 = require("../picker/contributions/canvas-picker/glyph-module"), glyph_module_2 = require("../picker/contributions/math-picker/glyph-module");

function _registerGlyph() {
    _registerGlyph.__loaded || (_registerGlyph.__loaded = !0, (0, vrender_core_1.registerGlyphGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.glyphModule), vrender_core_1.container.load(env_1.browser ? glyph_module_1.glyphCanvasPickModule : glyph_module_2.glyphMathPickModule));
}

_registerGlyph.__loaded = !1, exports.registerGlyph = _registerGlyph;
//# sourceMappingURL=register-glyph.js.map