import { ContainerModule } from "@visactor/vrender-core";

import { DefaultCanvasArcPicker } from "./arc-picker";

import { CanvasArcPicker, CanvasPickerContribution } from "../constants";

let loadArcPick = !1;

export const arcCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadArcPick || (loadArcPick = !0, bind(CanvasArcPicker).to(DefaultCanvasArcPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasArcPicker));
}));
//# sourceMappingURL=arc-module.js.map
