import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasArc3DRender } from "./arc3d-render";

import { Arc3dRender, GraphicRender } from "./symbol";

let loadArc3dModule = !1;

export const arc3dModule = new ContainerModule((bind => {
    loadArc3dModule || (loadArc3dModule = !0, bind(Arc3dRender).to(DefaultCanvasArc3DRender).inSingletonScope(), 
    bind(GraphicRender).toService(Arc3dRender));
}));
//# sourceMappingURL=arc3d-module.js.map
