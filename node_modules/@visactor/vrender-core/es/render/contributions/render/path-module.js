import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { PathRenderContribution } from "./contributions/constants";

import { DefaultCanvasPathRender } from "./path-render";

import { GraphicRender, PathRender } from "./symbol";

let loadPathModule = !1;

export const pathModule = new ContainerModule((bind => {
    loadPathModule || (loadPathModule = !0, bind(DefaultCanvasPathRender).toSelf().inSingletonScope(), 
    bind(PathRender).to(DefaultCanvasPathRender).inSingletonScope(), bind(GraphicRender).toService(PathRender), 
    bind(PathRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, PathRenderContribution));
}));
//# sourceMappingURL=path-module.js.map
