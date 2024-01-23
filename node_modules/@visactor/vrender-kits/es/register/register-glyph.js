import { container, glyphModule, registerGlyphGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { glyphCanvasPickModule } from "../picker/contributions/canvas-picker/glyph-module";

import { glyphMathPickModule } from "../picker/contributions/math-picker/glyph-module";

function _registerGlyph() {
    _registerGlyph.__loaded || (_registerGlyph.__loaded = !0, registerGlyphGraphic(), 
    container.load(glyphModule), container.load(browser ? glyphCanvasPickModule : glyphMathPickModule));
}

_registerGlyph.__loaded = !1;

export const registerGlyph = _registerGlyph;
//# sourceMappingURL=register-glyph.js.map