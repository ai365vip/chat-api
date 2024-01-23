import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasRect3dRender } from "./rect3d-render";

import { GraphicRender, Rect3DRender } from "./symbol";

let loadRect3dModule = !1;

export const rect3dModule = new ContainerModule((bind => {
    loadRect3dModule || (loadRect3dModule = !0, bind(Rect3DRender).to(DefaultCanvasRect3dRender).inSingletonScope(), 
    bind(GraphicRender).toService(Rect3DRender));
}));
//# sourceMappingURL=rect3d-module.js.map
