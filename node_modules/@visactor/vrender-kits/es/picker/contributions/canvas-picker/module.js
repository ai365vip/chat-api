import { ContainerModule, bindContributionProvider } from "@visactor/vrender-core";

import { CanvasGroupPicker, CanvasPickerContribution } from "../constants";

import { DefaultCanvasGroupPicker } from "./group-picker";

const m = new ContainerModule(((bind, unbind, isBound, rebind) => {
    m.__vloaded || (m.__vloaded = !0, bind(CanvasGroupPicker).to(DefaultCanvasGroupPicker).inSingletonScope(), 
    bind(CanvasPickerContribution).toService(CanvasGroupPicker), bindContributionProvider(bind, CanvasPickerContribution));
}));

m.__vloaded = !1;

export default m;
//# sourceMappingURL=module.js.map
