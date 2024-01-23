import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasPolygonPicker } from "../constants";

import { DefaultCanvasPolygonPicker } from "./polygon-picker";

let loadPolygonPick = !1;

export const polygonCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPolygonPick || (loadPolygonPick = !0, bind(CanvasPolygonPicker).to(DefaultCanvasPolygonPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasPolygonPicker));
}));
//# sourceMappingURL=polygon-module.js.map
