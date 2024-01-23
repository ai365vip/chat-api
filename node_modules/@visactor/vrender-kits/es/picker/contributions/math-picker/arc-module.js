import { ContainerModule } from "@visactor/vrender-core";

import { DefaultMathArcPicker } from "./arc-picker";

import { MathArcPicker, MathPickerContribution } from "../constants";

let loadArcPick = !1;

export const arcMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadArcPick || (loadArcPick = !0, bind(MathArcPicker).to(DefaultMathArcPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathArcPicker));
}));
//# sourceMappingURL=arc-module.js.map
