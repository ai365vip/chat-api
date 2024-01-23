import { ContainerModule } from "@visactor/vrender-core";

import { MathPickerContribution, MathSymbolPicker } from "../constants";

import { DefaultMathSymbolPicker } from "./symbol-picker";

let loadSymbolPick = !1;

export const symbolMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadSymbolPick || (loadSymbolPick = !0, bind(MathSymbolPicker).to(DefaultMathSymbolPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathSymbolPicker));
}));
//# sourceMappingURL=symbol-module.js.map
