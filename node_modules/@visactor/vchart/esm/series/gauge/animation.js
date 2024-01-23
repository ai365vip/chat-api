import { Factory } from "../../core";

const Appear_Grow = params => ({
    channel: {
        angle: {
            from: params.startAngle + Math.PI / 2
        }
    }
}), Appear_FadeIn = {
    type: "fadeIn"
};

export function gaugePointerPresetAnimation(params, preset) {
    return "fadeIn" === preset ? Appear_FadeIn : Appear_Grow(params);
}

export const registerGaugePointerAnimation = () => {
    Factory.registerAnimation("gaugePointer", ((params, preset) => {
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
//# sourceMappingURL=animation.js.map
