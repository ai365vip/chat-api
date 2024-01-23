import { ContainerModule } from "@visactor/vrender-core";

import { MathCirclePicker, MathPickerContribution } from "../constants";

import { DefaultMathCirclePicker } from "./circle-picker";

let loadCirclePick = !1;

export const circleMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadCirclePick || (loadCirclePick = !0, bind(MathCirclePicker).to(DefaultMathCirclePicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathCirclePicker));
}));
//# sourceMappingURL=circle-module.js.map
