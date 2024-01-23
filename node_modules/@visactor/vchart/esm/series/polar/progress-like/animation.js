import { Factory } from "../../../core/factory";

const Appear_Grow = params => ({
    type: "growAngleIn",
    options: {
        overall: params.startAngle
    }
}), Appear_FadeIn = {
    type: "fadeIn"
};

export function progressLikePresetAnimation(params, preset) {
    return "fadeIn" === preset ? Appear_FadeIn : Appear_Grow(params);
}

export const registerProgressLikeAnimation = () => {
    Factory.registerAnimation("circularProgress", ((params, preset) => ({
        appear: progressLikePresetAnimation(params, preset),
        enter: {
            type: "growAngleIn"
        },
        disappear: {
            type: "growAngleOut"
        }
    })));
};
//# sourceMappingURL=animation.js.map
