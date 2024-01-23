import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasRichTextRender } from "./richtext-render";

import { GraphicRender, RichTextRender } from "./symbol";

let loadRichtextModule = !1;

export const richtextModule = new ContainerModule((bind => {
    loadRichtextModule || (loadRichtextModule = !0, bind(RichTextRender).to(DefaultCanvasRichTextRender).inSingletonScope(), 
    bind(GraphicRender).toService(RichTextRender));
}));
//# sourceMappingURL=richtext-module.js.map
