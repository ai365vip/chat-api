"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerRangeColumnAnimation = exports.rangeColumnPresetAnimation = exports.rangeColumnGrowOut = exports.rangeColumnGrowIn = void 0;

const factory_1 = require("../../core/factory"), rangeColumnGrowIn = params => ({
    type: "growCenterIn",
    options: {
        direction: "horizontal" === params.direction ? "x" : "y"
    }
});

exports.rangeColumnGrowIn = rangeColumnGrowIn;

const Appear_FadeIn = {
    type: "fadeIn"
}, rangeColumnGrowOut = params => ({
    type: "growCenterOut",
    options: {
        direction: "horizontal" === params.direction ? "x" : "y"
    }
});

function rangeColumnPresetAnimation(params, preset) {
    return "fadeIn" === preset ? Appear_FadeIn : (0, exports.rangeColumnGrowIn)(params);
}

exports.rangeColumnGrowOut = rangeColumnGrowOut, exports.rangeColumnPresetAnimation = rangeColumnPresetAnimation;

const registerRangeColumnAnimation = () => {
    factory_1.Factory.registerAnimation("rangeColumn", ((params, preset) => ({
        appear: rangeColumnPresetAnimation(params, preset),
        enter: (0, exports.rangeColumnGrowIn)(params),
        exit: (0, exports.rangeColumnGrowOut)(params),
        disappear: (0, exports.rangeColumnGrowOut)(params)
    })));
};

exports.registerRangeColumnAnimation = registerRangeColumnAnimation;
//# sourceMappingURL=animation.js.map
