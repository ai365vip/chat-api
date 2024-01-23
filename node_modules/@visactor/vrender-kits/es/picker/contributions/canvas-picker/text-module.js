import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasTextPicker } from "../constants";

import { DefaultCanvasTextPicker } from "./text-picker";

let loadTextPick = !1;

export const textCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadTextPick || (loadTextPick = !0, bind(CanvasTextPicker).to(DefaultCanvasTextPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasTextPicker));
}));
//# sourceMappingURL=text-module.js.map
