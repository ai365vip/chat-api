import { ContainerModule } from "../../../common/inversify";

import { DefaultIncrementalCanvasLineRender } from "./incremental-line-render";

import { DefaultCanvasLineRender } from "./line-render";

import { GraphicRender, LineRender } from "./symbol";

let loadLineModule = !1;

export const lineModule = new ContainerModule((bind => {
    loadLineModule || (loadLineModule = !0, bind(DefaultCanvasLineRender).toSelf().inSingletonScope(), 
    bind(DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope(), bind(LineRender).to(DefaultCanvasLineRender).inSingletonScope(), 
    bind(GraphicRender).toService(LineRender));
}));
//# sourceMappingURL=line-module.js.map
