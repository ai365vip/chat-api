import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasRectPicker } from "../constants";

import { DefaultCanvasRectPicker } from "./rect-picker";

let loadRectPick = !1;

export const rectCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRectPick || (loadRectPick = !0, bind(CanvasRectPicker).to(DefaultCanvasRectPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasRectPicker));
}));
//# sourceMappingURL=rect-module.js.map
