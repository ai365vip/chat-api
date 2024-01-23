import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasPyramid3dPicker } from "../constants";

import { DefaultCanvasPyramid3dPicker } from "./pyramid3d-picker";

let loadPyramid3dPick = !1;

export const pyramid3dCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPyramid3dPick || (loadPyramid3dPick = !0, bind(CanvasPyramid3dPicker).to(DefaultCanvasPyramid3dPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasPyramid3dPicker));
}));
//# sourceMappingURL=pyramid3d-module.js.map
