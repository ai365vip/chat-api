import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { PolygonRenderContribution } from "./contributions/constants";

import { DefaultCanvasPolygonRender } from "./polygon-render";

import { GraphicRender, PolygonRender } from "./symbol";

let loadPolygonModule = !1;

export const polygonModule = new ContainerModule((bind => {
    loadPolygonModule || (loadPolygonModule = !0, bind(PolygonRender).to(DefaultCanvasPolygonRender).inSingletonScope(), 
    bind(GraphicRender).toService(PolygonRender), bind(PolygonRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, PolygonRenderContribution));
}));
//# sourceMappingURL=polygon-module.js.map
