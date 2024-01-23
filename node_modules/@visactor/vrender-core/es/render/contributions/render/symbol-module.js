import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { SymbolRenderContribution } from "./contributions/constants";

import { GraphicRender, SymbolRender } from "./symbol";

import { DefaultCanvasSymbolRender } from "./symbol-render";

let loadSymbolModule = !1;

export const symbolModule = new ContainerModule((bind => {
    loadSymbolModule || (loadSymbolModule = !0, bind(DefaultCanvasSymbolRender).toSelf().inSingletonScope(), 
    bind(SymbolRender).to(DefaultCanvasSymbolRender).inSingletonScope(), bind(GraphicRender).toService(SymbolRender), 
    bind(SymbolRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, SymbolRenderContribution));
}));
//# sourceMappingURL=symbol-module.js.map
