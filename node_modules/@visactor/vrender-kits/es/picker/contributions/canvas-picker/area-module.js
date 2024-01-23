import { ContainerModule } from "@visactor/vrender-core";

import { CanvasAreaPicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasAreaPicker } from "./area-picker";

let loadAreaPick = !1;

export const areaCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadAreaPick || (loadAreaPick = !0, bind(CanvasAreaPicker).to(DefaultCanvasAreaPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasAreaPicker));
}));
//# sourceMappingURL=area-module.js.map
