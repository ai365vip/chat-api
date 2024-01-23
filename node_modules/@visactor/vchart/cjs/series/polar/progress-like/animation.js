"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerProgressLikeAnimation = exports.progressLikePresetAnimation = void 0;

const factory_1 = require("../../../core/factory"), Appear_Grow = params => ({
    type: "growAngleIn",
    options: {
        overall: params.startAngle
    }
}), Appear_FadeIn = {
    type: "fadeIn"
};

function progressLikePresetAnimation(params, preset) {
    return "fadeIn" === preset ? Appear_FadeIn : Appear_Grow(params);
}

exports.progressLikePresetAnimation = progressLikePresetAnimation;

const registerProgressLikeAnimation = () => {
    factory_1.Factory.registerAnimation("circularProgress", ((params, preset) => ({
        appear: progressLikePresetAnimation(params, preset),
        enter: {
            type: "growAngleIn"
        },
        disappear: {
            type: "growAngleOut"
        }
    })));
};

exports.registerProgressLikeAnimation = registerProgressLikeAnimation;
//# sourceMappingURL=animation.js.map
