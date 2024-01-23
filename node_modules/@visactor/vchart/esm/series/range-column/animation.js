import { Factory } from "../../core/factory";

export const rangeColumnGrowIn = params => ({
    type: "growCenterIn",
    options: {
        direction: "horizontal" === params.direction ? "x" : "y"
    }
});

const Appear_FadeIn = {
    type: "fadeIn"
};

export const rangeColumnGrowOut = params => ({
    type: "growCenterOut",
    options: {
        direction: "horizontal" === params.direction ? "x" : "y"
    }
});

export function rangeColumnPresetAnimation(params, preset) {
    return "fadeIn" === preset ? Appear_FadeIn : rangeColumnGrowIn(params);
}

export const registerRangeColumnAnimation = () => {
    Factory.registerAnimation("rangeColumn", ((params, preset) => ({
        appear: rangeColumnPresetAnimation(params, preset),
        enter: rangeColumnGrowIn(params),
        exit: rangeColumnGrowOut(params),
        disappear: rangeColumnGrowOut(params)
    })));
};
//# sourceMappingURL=animation.js.map
