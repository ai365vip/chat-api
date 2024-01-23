import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasCircleRender } from "./circle-render";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { CircleRenderContribution } from "./contributions/constants";

import { CircleRender, GraphicRender } from "./symbol";

let loadCircleModule = !1;

export const circleModule = new ContainerModule((bind => {
    loadCircleModule || (loadCircleModule = !0, bind(DefaultCanvasCircleRender).toSelf().inSingletonScope(), 
    bind(CircleRender).to(DefaultCanvasCircleRender).inSingletonScope(), bind(GraphicRender).toService(CircleRender), 
    bind(CircleRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, CircleRenderContribution));
}));
//# sourceMappingURL=circle-module.js.map
