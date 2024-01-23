import { ContainerModule } from "../../../common/inversify-lite";

import { bindContributionProvider } from "../../../common/contribution-provider";

import { DefaultDrawContribution } from "./draw-contribution";

import { DefaultCanvasGroupRender } from "./group-render";

import { DefaultIncrementalDrawContribution } from "./incremental-draw-contribution";

import { DrawContribution, GraphicRender, GroupRender, IncrementalDrawContribution } from "./symbol";

import { CommonDrawItemInterceptorContribution, DrawItemInterceptor } from "./draw-interceptor";

import { GroupRenderContribution, InteractiveSubRenderContribution } from "./contributions/constants";

import { DefaultBaseBackgroundRenderContribution, DefaultBaseInteractiveRenderContribution, DefaultBaseTextureRenderContribution } from "./contributions";

export default new ContainerModule((bind => {
    bind(DefaultBaseBackgroundRenderContribution).toSelf().inSingletonScope(), bind(DefaultBaseTextureRenderContribution).toSelf().inSingletonScope(), 
    bind(DrawContribution).to(DefaultDrawContribution), bind(IncrementalDrawContribution).to(DefaultIncrementalDrawContribution), 
    bind(GroupRender).to(DefaultCanvasGroupRender).inSingletonScope(), bind(GraphicRender).toService(GroupRender), 
    bindContributionProvider(bind, GroupRenderContribution), bind(DefaultBaseInteractiveRenderContribution).toSelf().inSingletonScope(), 
    bindContributionProvider(bind, InteractiveSubRenderContribution), bindContributionProvider(bind, GraphicRender), 
    bind(CommonDrawItemInterceptorContribution).toSelf().inSingletonScope(), bind(DrawItemInterceptor).toService(CommonDrawItemInterceptorContribution), 
    bindContributionProvider(bind, DrawItemInterceptor);
}));
//# sourceMappingURL=module.js.map
