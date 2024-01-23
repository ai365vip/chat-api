import { ContainerModule } from "@visactor/vrender-core";

import { CanvasCirclePicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasCirclePicker } from "./circle-picker";

let loadCirclePick = !1;

export const circleCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadCirclePick || (loadCirclePick = !0, bind(CanvasCirclePicker).to(DefaultCanvasCirclePicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasCirclePicker));
}));
//# sourceMappingURL=circle-module.js.map
