import { Factory } from "../../core/factory";

import { ScaleInOutAnimation } from "../../animation/config";

export const scatterPresetAnimation = (_params, preset) => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "scaleIn"
};

export const registerScatterAnimation = () => {
    Factory.registerAnimation("scatter", ((params, preset) => Object.assign({
        appear: scatterPresetAnimation(0, preset)
    }, ScaleInOutAnimation)));
};
//# sourceMappingURL=animation.js.map
