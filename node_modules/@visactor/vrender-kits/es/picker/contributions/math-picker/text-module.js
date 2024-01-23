import { ContainerModule } from "@visactor/vrender-core";

import { MathPickerContribution, MathTextPicker } from "../constants";

import { DefaultMathTextPicker } from "./text-picker";

let loadTextPick = !1;

export const textMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadTextPick || (loadTextPick = !0, bind(MathTextPicker).to(DefaultMathTextPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathTextPicker));
}));
//# sourceMappingURL=text-module.js.map
