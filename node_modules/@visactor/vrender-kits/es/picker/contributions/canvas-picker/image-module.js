import { ContainerModule } from "@visactor/vrender-core";

import { CanvasImagePicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasImagePicker } from "./image-picker";

let loadImagePick = !1;

export const imageCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadImagePick || (loadImagePick = !0, bind(CanvasImagePicker).to(DefaultCanvasImagePicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasImagePicker));
}));
//# sourceMappingURL=image-module.js.map
