import { ContainerModule } from "@visactor/vrender-core";

import { MathPathPicker, MathPickerContribution } from "../constants";

import { DefaultMathPathPicker } from "./path-picker";

let loadPathPick = !1;

export const pathMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadPathPick || (loadPathPick = !0, bind(MathPathPicker).to(DefaultMathPathPicker).inSingletonScope(), 
    bind(MathPickerContribution).toService(MathPathPicker));
}));
//# sourceMappingURL=path-module.js.map
