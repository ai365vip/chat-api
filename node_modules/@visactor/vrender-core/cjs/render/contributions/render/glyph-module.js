"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.glyphModule = void 0;

const inversify_1 = require("../../../common/inversify"), glyph_render_1 = require("./glyph-render"), symbol_1 = require("./symbol");

let loadGlyphModule = !1;

exports.glyphModule = new inversify_1.ContainerModule((bind => {
    loadGlyphModule || (loadGlyphModule = !0, bind(symbol_1.GlyphRender).to(glyph_render_1.DefaultCanvasGlyphRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.GlyphRender));
}));
//# sourceMappingURL=glyph-module.js.map
