"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGlyphGraphic = void 0;

const glyph_1 = require("../graphic/glyph"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerGlyphGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("glyph", glyph_1.createGlyph);
}

exports.registerGlyphGraphic = registerGlyphGraphic;
//# sourceMappingURL=register-glyph.js.map
