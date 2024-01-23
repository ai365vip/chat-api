"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.invokeAnimateSpec = exports.normalizeStateAnimationConfig = exports.normalizeAnimationConfig = void 0;

const vutils_1 = require("@visactor/vutils"), constants_1 = require("../constants");

function transformToTimelineConfig(animationConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    if ((0, vutils_1.isNil)(animationConfig.timeSlices)) {
        const typeConfig = animationConfig;
        return {
            startTime: null !== (_a = typeConfig.startTime) && void 0 !== _a ? _a : constants_1.DefaultAnimationStartTime,
            totalTime: typeConfig.totalTime,
            oneByOne: null !== (_b = typeConfig.oneByOne) && void 0 !== _b ? _b : constants_1.DefaultAnimationOneByOne,
            loop: null !== (_c = typeConfig.loop) && void 0 !== _c ? _c : constants_1.DefaultAnimationLoop,
            controlOptions: (0, vutils_1.merge)({}, constants_1.DefaultAnimationControlOptions, null !== (_d = typeConfig.controlOptions) && void 0 !== _d ? _d : {}),
            timeSlices: [ {
                duration: null !== (_e = typeConfig.duration) && void 0 !== _e ? _e : constants_1.DefaultAnimationDuration,
                delay: null !== (_f = typeConfig.delay) && void 0 !== _f ? _f : constants_1.DefaultAnimationDelay,
                delayAfter: null !== (_g = typeConfig.delayAfter) && void 0 !== _g ? _g : constants_1.DefaultAnimationDelayAfter,
                effects: [ {
                    type: typeConfig.type,
                    channel: typeConfig.channel,
                    custom: typeConfig.custom,
                    easing: null !== (_h = typeConfig.easing) && void 0 !== _h ? _h : constants_1.DefaultAnimationEasing,
                    customParameters: typeConfig.customParameters,
                    options: typeConfig.options
                } ]
            } ]
        };
    }
    const formattedTimeSlices = (0, vutils_1.array)(animationConfig.timeSlices).filter((timeSlice => timeSlice.effects && (0, 
    vutils_1.array)(timeSlice.effects).filter((effect => effect.channel || effect.type)).length));
    if (formattedTimeSlices.length) return {
        startTime: null !== (_j = animationConfig.startTime) && void 0 !== _j ? _j : constants_1.DefaultAnimationStartTime,
        totalTime: animationConfig.totalTime,
        oneByOne: null !== (_k = animationConfig.oneByOne) && void 0 !== _k ? _k : constants_1.DefaultAnimationOneByOne,
        loop: null !== (_l = animationConfig.loop) && void 0 !== _l ? _l : constants_1.DefaultAnimationLoop,
        controlOptions: (0, vutils_1.merge)({}, constants_1.DefaultAnimationControlOptions, null !== (_m = animationConfig.controlOptions) && void 0 !== _m ? _m : {}),
        timeSlices: formattedTimeSlices.map((timeSlice => {
            var _a, _b;
            return {
                duration: timeSlice.duration,
                delay: null !== (_a = timeSlice.delay) && void 0 !== _a ? _a : constants_1.DefaultAnimationDelay,
                delayAfter: null !== (_b = timeSlice.delayAfter) && void 0 !== _b ? _b : constants_1.DefaultAnimationDelayAfter,
                effects: (0, vutils_1.array)(timeSlice.effects).filter((effect => effect.channel || effect.type)).map((effect => {
                    var _a;
                    return {
                        type: effect.type,
                        channel: effect.channel,
                        custom: effect.custom,
                        easing: null !== (_a = effect.easing) && void 0 !== _a ? _a : constants_1.DefaultAnimationEasing,
                        customParameters: effect.customParameters,
                        options: effect.options
                    };
                }))
            };
        })),
        partitioner: animationConfig.partitioner,
        sort: animationConfig.sort
    };
}

function normalizeAnimationConfig(config) {
    let normalizedConfig = [];
    return Object.keys(config).forEach((state => {
        normalizedConfig = normalizedConfig.concat(normalizeStateAnimationConfig(state, config[state]));
    })), normalizedConfig;
}

function normalizeStateAnimationConfig(state, config, initialIndex = 0) {
    const normalizedConfig = [];
    let index = initialIndex;
    return (0, vutils_1.array)(config).forEach((animationConfig => {
        var _a;
        const timelineConfig = transformToTimelineConfig(animationConfig);
        timelineConfig && (normalizedConfig.push({
            state: state,
            id: null !== (_a = timelineConfig.id) && void 0 !== _a ? _a : `${state}-${index}`,
            timeline: timelineConfig,
            originConfig: animationConfig
        }), index += 1);
    })), normalizedConfig;
}

function invokeAnimateSpec(spec, element, parameters) {
    return (0, vutils_1.isFunction)(spec) ? spec.call(null, element.getDatum(), element, parameters) : spec;
}

exports.normalizeAnimationConfig = normalizeAnimationConfig, exports.normalizeStateAnimationConfig = normalizeStateAnimationConfig, 
exports.invokeAnimateSpec = invokeAnimateSpec;
//# sourceMappingURL=config.js.map
