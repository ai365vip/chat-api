import { ContainerModule } from "@visactor/vrender-core";

import { MathGlyphPicker } from "../constants";

import { DefaultMathGlyphPicker } from "./glyph-picker";

let loadGlyphPick = !1;

export const glyphMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadGlyphPick || (loadGlyphPick = !0, bind(MathGlyphPicker).to(DefaultMathGlyphPicker).inSingletonScope(), 
    bind(DefaultMathGlyphPicker).toService(MathGlyphPicker));
}));
//# sourceMappingURL=glyph-module.js.map
