import { ContainerModule } from "@visactor/vrender-core";

import { CanvasGlyphPicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasGlyphPicker } from "./glyph-picker";

let loadGlyphPick = !1;

export const glyphCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadGlyphPick || (loadGlyphPick = !0, bind(CanvasGlyphPicker).to(DefaultCanvasGlyphPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasGlyphPicker));
}));
//# sourceMappingURL=glyph-module.js.map
