"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerHeatmapAnimation = exports.heatmapPresetAnimation = void 0;

const factory_1 = require("../../core/factory"), config_1 = require("../../animation/config");

function heatmapPresetAnimation(preset) {
    return !1 === preset ? {} : {
        type: "fadeIn"
    };
}

exports.heatmapPresetAnimation = heatmapPresetAnimation;

const registerHeatmapAnimation = () => {
    factory_1.Factory.registerAnimation("heatmap", ((params, preset) => Object.assign(Object.assign({}, config_1.FadeInOutAnimation), {
        appear: heatmapPresetAnimation(preset)
    })));
};

exports.registerHeatmapAnimation = registerHeatmapAnimation;
//# sourceMappingURL=animation.js.map
