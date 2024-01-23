import { Factory } from "../../core/factory";

export const circlePackingPresetAnimation = preset => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "growRadiusIn"
};

export const registerCirclePackingAnimation = () => {
    Factory.registerAnimation("circlePacking", ((parmas, preset) => ({
        appear: circlePackingPresetAnimation(preset),
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
//# sourceMappingURL=animation.js.map
