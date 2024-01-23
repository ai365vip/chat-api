import { bindContributionProvider } from "../../../common/contribution-provider";

import { ContainerModule } from "../../../common/inversify";

import { DefaultBaseInteractiveRenderContribution } from "./contributions";

import { TextRenderContribution } from "./contributions/constants";

import { GraphicRender, TextRender } from "./symbol";

import { DefaultCanvasTextRender } from "./text-render";

let loadTextModule = !1;

export const textModule = new ContainerModule((bind => {
    loadTextModule || (loadTextModule = !0, bind(TextRender).to(DefaultCanvasTextRender).inSingletonScope(), 
    bind(GraphicRender).toService(TextRender), bind(TextRenderContribution).toService(DefaultBaseInteractiveRenderContribution), 
    bindContributionProvider(bind, TextRenderContribution));
}));
//# sourceMappingURL=text-module.js.map
