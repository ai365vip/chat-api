import { ContainerModule, bindContributionProvider } from "@visactor/vrender-core";

import { MathPickerContribution } from "../constants";

const m = new ContainerModule((bind => {
    m.__vloaded || (m.__vloaded = !0, bindContributionProvider(bind, MathPickerContribution));
}));

m.__vloaded = !1;

export default m;
//# sourceMappingURL=module.js.map
