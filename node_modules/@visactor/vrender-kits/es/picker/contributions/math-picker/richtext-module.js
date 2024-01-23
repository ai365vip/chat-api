import { ContainerModule } from "@visactor/vrender-core";

import { MathImagePicker } from "../constants";

import { DefaultMathImagePicker } from "./image-picker";

let loadRichTextPick = !1;

export const richTextMathPickModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    loadRichTextPick || (loadRichTextPick = !0, bind(MathImagePicker).to(DefaultMathImagePicker).inSingletonScope(), 
    bind(DefaultMathImagePicker).toService(MathImagePicker));
}));
//# sourceMappingURL=richtext-module.js.map
