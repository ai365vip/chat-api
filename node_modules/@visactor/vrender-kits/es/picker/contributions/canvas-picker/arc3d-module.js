import { ContainerModule } from "@visactor/vrender-core";

import { CanvasArc3dPicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasArc3dPicker } from "./arc3d-picker";

let loadArc3dPick = !1;

export const arc3dCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadArc3dPick || (loadArc3dPick = !0, bind(CanvasArc3dPicker).to(DefaultCanvasArc3dPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasArc3dPicker));
}));
//# sourceMappingURL=arc3d-module.js.map
