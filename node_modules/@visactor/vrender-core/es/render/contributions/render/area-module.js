import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasAreaRender } from "./area-render";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { AreaRenderContribution } from "./contributions/constants";

import { DefaultIncrementalCanvasAreaRender } from "./incremental-area-render";

import { AreaRender, GraphicRender } from "./symbol";

let loadAreaModule = !1;

export const areaModule = new ContainerModule((bind => {
    loadAreaModule || (loadAreaModule = !0, bind(DefaultCanvasAreaRender).toSelf().inSingletonScope(), 
    bind(AreaRender).to(DefaultCanvasAreaRender).inSingletonScope(), bind(GraphicRender).toService(AreaRender), 
    bind(AreaRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, AreaRenderContribution), bind(DefaultIncrementalCanvasAreaRender).toSelf().inSingletonScope());
}));
//# sourceMappingURL=area-module.js.map
