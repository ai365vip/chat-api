import { ContainerModule } from "@visactor/vrender-core";

import { MathPickerContribution, MathPolygonPicker } from "../constants";

import { DefaultMathPolygonPicker } from "./polygon-picker";

let loadPolygonPick = !1;

export const polygonMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPolygonPick || (loadPolygonPick = !0, bind(MathPolygonPicker).to(DefaultMathPolygonPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathPolygonPicker));
}));
//# sourceMappingURL=polygon-module.js.map
