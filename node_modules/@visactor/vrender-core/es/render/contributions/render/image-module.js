import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { ImageRenderContribution } from "./contributions/constants";

import { DefaultCanvasImageRender } from "./image-render";

import { GraphicRender, ImageRender } from "./symbol";

let loadImageModule = !1;

export const imageModule = new ContainerModule((bind => {
    loadImageModule || (loadImageModule = !0, bind(ImageRender).to(DefaultCanvasImageRender).inSingletonScope(), 
    bind(GraphicRender).toService(ImageRender), bind(ImageRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, ImageRenderContribution));
}));
//# sourceMappingURL=image-module.js.map
