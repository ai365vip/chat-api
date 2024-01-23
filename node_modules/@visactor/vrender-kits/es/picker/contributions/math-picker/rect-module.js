import { ContainerModule } from "@visactor/vrender-core";

import { MathPickerContribution, MathRectPicker } from "../constants";

import { DefaultMathRectPicker } from "./rect-picker";

let loadRectPick = !1;

export const rectMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRectPick || (loadRectPick = !0, bind(MathRectPicker).to(DefaultMathRectPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathRectPicker));
}));
//# sourceMappingURL=rect-module.js.map
