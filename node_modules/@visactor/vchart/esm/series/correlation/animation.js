import { Factory } from "../../core/factory";

import { ScaleInOutAnimation } from "../../animation/config";

export const correlationPresetAnimation = (_params, preset) => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "scaleIn"
};

export const registerCorrelationAnimation = () => {
    Factory.registerAnimation("correlation", ((params, preset) => Object.assign({
        appear: correlationPresetAnimation(0, preset)
    }, ScaleInOutAnimation)));
};
//# sourceMappingURL=animation.js.map
