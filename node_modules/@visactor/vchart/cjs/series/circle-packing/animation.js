"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerCirclePackingAnimation = exports.circlePackingPresetAnimation = void 0;

const factory_1 = require("../../core/factory"), circlePackingPresetAnimation = preset => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "growRadiusIn"
};

exports.circlePackingPresetAnimation = circlePackingPresetAnimation;

const registerCirclePackingAnimation = () => {
    factory_1.Factory.registerAnimation("circlePacking", ((parmas, preset) => ({
        appear: (0, exports.circlePackingPresetAnimation)(preset),
        enter: {
            type: "growRadiusIn"
        },
        exit: {
            type: "growRadiusOut"
        },
        disappear: {
            type: "growRadiusOut"
        }
    })));
};

exports.registerCirclePackingAnimation = registerCirclePackingAnimation;
//# sourceMappingURL=animation.js.map
