import { barGrowIn, barGrowOut } from "../bar/animation";

import { Factory } from "../../core/factory";

const Appear_FadeIn = {
    type: "fadeIn"
}, Appear_ScaleIn = {
    type: "growCenterIn"
};

export function waterfallPresetAnimation(params, preset) {
    switch (preset) {
      case "fadeIn":
        return Appear_FadeIn;

      case "scaleIn":
        return Appear_ScaleIn;

      default:
        return barGrowIn(params, !1);
    }
}

export const registerWaterfallAnimation = () => {
    Factory.registerAnimation("waterfall", ((params, preset) => ({
        appear: waterfallPresetAnimation(params, preset),
        enter: barGrowIn(params, !1),
        exit: barGrowOut(params, !1),
        disappear: barGrowOut(params, !1)
    })));
};
//# sourceMappingURL=animation.js.map
