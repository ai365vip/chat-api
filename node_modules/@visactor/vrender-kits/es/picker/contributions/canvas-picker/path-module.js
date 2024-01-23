import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPathPicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasPathPicker } from "./path-picker";

let loadPathPick = !1;

export const pathCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPathPick || (loadPathPick = !0, bind(CanvasPathPicker).to(DefaultCanvasPathPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasPathPicker));
}));
//# sourceMappingURL=path-module.js.map
