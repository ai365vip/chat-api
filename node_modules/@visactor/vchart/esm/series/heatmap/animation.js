import { Factory } from "../../core/factory";

import { FadeInOutAnimation } from "../../animation/config";

export function heatmapPresetAnimation(preset) {
    return !1 === preset ? {} : {
        type: "fadeIn"
    };
}

export const registerHeatmapAnimation = () => {
    Factory.registerAnimation("heatmap", ((params, preset) => Object.assign(Object.assign({}, FadeInOutAnimation), {
        appear: heatmapPresetAnimation(preset)
    })));
};
//# sourceMappingURL=animation.js.map
