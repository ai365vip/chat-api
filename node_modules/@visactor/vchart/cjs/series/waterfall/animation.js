"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerWaterfallAnimation = exports.waterfallPresetAnimation = void 0;

const animation_1 = require("../bar/animation"), factory_1 = require("../../core/factory"), Appear_FadeIn = {
    type: "fadeIn"
}, Appear_ScaleIn = {
    type: "growCenterIn"
};

function waterfallPresetAnimation(params, preset) {
    switch (preset) {
      case "fadeIn":
        return Appear_FadeIn;

      case "scaleIn":
        return Appear_ScaleIn;

      default:
        return (0, animation_1.barGrowIn)(params, !1);
    }
}

exports.waterfallPresetAnimation = waterfallPresetAnimation;

const registerWaterfallAnimation = () => {
    factory_1.Factory.registerAnimation("waterfall", ((params, preset) => ({
        appear: waterfallPresetAnimation(params, preset),
        enter: (0, animation_1.barGrowIn)(params, !1),
        exit: (0, animation_1.barGrowOut)(params, !1),
        disappear: (0, animation_1.barGrowOut)(params, !1)
    })));
};

exports.registerWaterfallAnimation = registerWaterfallAnimation;
//# sourceMappingURL=animation.js.map
