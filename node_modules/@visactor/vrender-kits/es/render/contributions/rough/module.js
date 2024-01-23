import { ContainerModule, GraphicRender } from "@visactor/vrender-core";

import { RoughCanvasArcRender } from "./rough-arc";

import { RoughCanvasAreaRender } from "./rough-area";

import { RoughCanvasCircleRender } from "./rough-circle";

import { RoughCanvasLineRender } from "./rough-line";

import { RoughCanvasPathRender } from "./rough-path";

import { RoughCanvasRectRender } from "./rough-rect";

import { RoughCanvasSymbolRender } from "./rough-symbol";

export default new ContainerModule((bind => {
    bind(RoughCanvasCircleRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasCircleRender), 
    bind(RoughCanvasRectRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasRectRender), 
    bind(RoughCanvasPathRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasPathRender), 
    bind(RoughCanvasSymbolRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasSymbolRender), 
    bind(RoughCanvasLineRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasLineRender), 
    bind(RoughCanvasAreaRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasAreaRender), 
    bind(RoughCanvasArcRender).toSelf().inSingletonScope(), bind(GraphicRender).to(RoughCanvasArcRender);
}));
//# sourceMappingURL=module.js.map
