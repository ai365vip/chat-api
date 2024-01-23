import { ContainerModule } from "@visactor/vrender-core";

import { MathAreaPicker, MathPickerContribution } from "../constants";

import { DefaultMathAreaPicker } from "./area-picker";

let loadAreaPick = !1;

export const areaMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadAreaPick || (loadAreaPick = !0, bind(MathAreaPicker).to(DefaultMathAreaPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathAreaPicker));
}));
//# sourceMappingURL=area-module.js.map
