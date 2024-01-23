import { Factory } from "../../../core/factory";

import { sunburstEnter } from "./enter";

import { sunburstExit } from "./exit";

import { sunburstPresetAnimation } from "./preset";

export * from "./preset";

export * from "./enter";

export * from "./exit";

export * from "./preset";

export * from "./interface";

export const registerSunburstAnimation = () => {
    Factory.registerAnimation("sunburst", ((params, preset) => ({
        appear: sunburstPresetAnimation(params, preset),
        enter: sunburstEnter(params),
        exit: sunburstExit(params),
        disappear: sunburstExit(params)
    })));
};
//# sourceMappingURL=index.js.map
