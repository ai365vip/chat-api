import { ContainerModule } from "@visactor/vrender-core";

import { MathLinePicker, MathPickerContribution } from "../constants";

import { DefaultMathLinePicker } from "./line-picker";

let loadLinePick = !1;

export const lineMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadLinePick || (loadLinePick = !0, bind(MathLinePicker).to(DefaultMathLinePicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathLinePicker));
}));
//# sourceMappingURL=line-module.js.map
