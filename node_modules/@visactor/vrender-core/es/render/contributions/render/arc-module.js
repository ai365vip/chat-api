import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasArcRender } from "./arc-render";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { ArcRenderContribution } from "./contributions/constants";

import { ArcRender, GraphicRender } from "./symbol";

let loadArcModule = !1;

export const arcModule = new ContainerModule((bind => {
    loadArcModule || (loadArcModule = !0, bind(DefaultCanvasArcRender).toSelf().inSingletonScope(), 
    bind(ArcRender).to(DefaultCanvasArcRender).inSingletonScope(), bind(GraphicRender).toService(ArcRender), 
    bind(ArcRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, ArcRenderContribution));
}));
//# sourceMappingURL=arc-module.js.map
