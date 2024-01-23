import { ContainerModule } from "../../../common/inversify";

import { DefaultCanvasPyramid3dRender } from "./pyramid3d-render";

import { GraphicRender, Pyramid3dRender } from "./symbol";

let loadPyramid3dModule = !1;

export const pyramid3dModule = new ContainerModule((bind => {
    loadPyramid3dModule || (loadPyramid3dModule = !0, bind(Pyramid3dRender).to(DefaultCanvasPyramid3dRender).inSingletonScope(), 
    bind(GraphicRender).toService(Pyramid3dRender));
}));
//# sourceMappingURL=pyramid3d-module.js.map
