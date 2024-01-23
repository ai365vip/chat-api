"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGaugePointerAnimation = exports.gaugePointerPresetAnimation = void 0;

const core_1 = require("../../core"), Appear_Grow = params => ({
    channel: {
        angle: {
            from: params.startAngle + Math.PI / 2
        }
    }
}), Appear_FadeIn = {
    type: "fadeIn"
};

function gaugePointerPresetAnimation(params, preset) {
    return "fadeIn" === preset ? Appear_FadeIn : Appear_Grow(params);
}

exports.gaugePointerPresetAnimation = gaugePointerPresetAnimation;

const registerGaugePointerAnimation = () => {
    core_1.Factory.registerAnimation("gaugePointer", ((params, preset) => {
        const animation = gaugePointerPresetAnimation(params, preset);
        return {
            appear: animation,
            enter: animation,
            disappear: {
                type: "fadeOut"
            }
        };
    }));
};

exports.registerGaugePointerAnimation = registerGaugePointerAnimation;
//# sourceMappingURL=animation.js.map
