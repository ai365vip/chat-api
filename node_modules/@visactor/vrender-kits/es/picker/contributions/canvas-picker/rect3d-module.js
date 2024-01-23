import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasRect3dPicker } from "../constants";

import { DefaultCanvasRect3dPicker } from "./rect3d-picker";

let loadRect3dPick = !1;

export const rect3dCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRect3dPick || (loadRect3dPick = !0, bind(CanvasRect3dPicker).to(DefaultCanvasRect3dPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasRect3dPicker));
}));
//# sourceMappingURL=rect3d-module.js.map
