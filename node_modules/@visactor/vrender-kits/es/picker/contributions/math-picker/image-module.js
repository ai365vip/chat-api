import { ContainerModule } from "@visactor/vrender-core";

import { MathImagePicker } from "../constants";

import { DefaultMathImagePicker } from "./image-picker";

let loadImagePick = !1;

export const imageMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadImagePick || (loadImagePick = !0, bind(MathImagePicker).to(DefaultMathImagePicker).inSingletonScope(), 
    bind(DefaultMathImagePicker).toService(MathImagePicker));
}));
//# sourceMappingURL=image-module.js.map
