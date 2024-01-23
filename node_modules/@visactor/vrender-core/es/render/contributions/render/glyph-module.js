import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasGlyphRender } from "./glyph-render";

import { GlyphRender, GraphicRender } from "./symbol";

let loadGlyphModule = !1;

export const glyphModule = new ContainerModule((bind => {
    loadGlyphModule || (loadGlyphModule = !0, bind(GlyphRender).to(DefaultCanvasGlyphRender).inSingletonScope(), 
    bind(GraphicRender).toService(GlyphRender));
}));
//# sourceMappingURL=glyph-module.js.map
