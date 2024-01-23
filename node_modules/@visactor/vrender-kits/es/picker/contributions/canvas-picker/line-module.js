import { ContainerModule } from "@visactor/vrender-core";

import { CanvasLinePicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasLinePicker } from "./line-picker";

let loadLinePick = !1;

export const lineCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadLinePick || (loadLinePick = !0, bind(CanvasLinePicker).to(DefaultCanvasLinePicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasLinePicker));
}));
//# sourceMappingURL=line-module.js.map
