import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultBaseInteractiveRenderContribution, SplitRectAfterRenderContribution, SplitRectBeforeRenderContribution } from "./contributions";

import { RectRenderContribution } from "./contributions/constants";

import { DefaultCanvasRectRender } from "./rect-render";

import { GraphicRender, RectRender } from "./symbol";

let loadRectModule = !1;

export const rectModule = new ContainerModule((bind => {
    loadRectModule || (loadRectModule = !0, bind(DefaultCanvasRectRender).toSelf().inSingletonScope(), 
    bind(RectRender).to(DefaultCanvasRectRender).inSingletonScope(), bind(GraphicRender).toService(RectRender), 
    bind(SplitRectAfterRenderContribution).toSelf(), bind(SplitRectBeforeRenderContribution).toSelf(), 
    bind(RectRenderContribution).toService(SplitRectAfterRenderContribution), bind(RectRenderContribution).toService(SplitRectBeforeRenderContribution), 
    bind(RectRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, RectRenderContribution));
}));
//# sourceMappingURL=rect-module.js.map
