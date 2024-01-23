import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasSymbolPicker } from "../constants";

import { DefaultCanvasSymbolPicker } from "./symbol-picker";

let loadSymbolPick = !1;

export const symbolCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadSymbolPick || (loadSymbolPick = !0, bind(CanvasSymbolPicker).to(DefaultCanvasSymbolPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasSymbolPicker));
}));
//# sourceMappingURL=symbol-module.js.map
