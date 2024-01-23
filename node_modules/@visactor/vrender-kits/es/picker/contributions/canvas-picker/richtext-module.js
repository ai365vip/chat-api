import { ContainerModule } from "@visactor/vrender-core";

import { CanvasPickerContribution, CanvasRichTextPicker } from "../constants";

import { DefaultCanvasRichTextPicker } from "./richtext-picker";

let loadRichtextPick = !1;

export const richtextCanvasPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRichtextPick || (loadRichtextPick = !0, bind(CanvasRichTextPicker).to(DefaultCanvasRichTextPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasRichTextPicker));
}));
//# sourceMappingURL=richtext-module.js.map
