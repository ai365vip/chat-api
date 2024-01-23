"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.symmetry = void 0;

const vutils_1 = require("@visactor/vutils"), symmetryByChannel = (upstreamData, channel, align) => {
    const baseChannel = `${channel}1`, hasRangeValue = upstreamData.some((el => !(0, 
    vutils_1.isNil)(el.getItemAttribute(baseChannel)))), middleValues = hasRangeValue ? upstreamData.map((el => (el.getItemAttribute(baseChannel) + el.getItemAttribute(channel)) / 2)) : upstreamData.map((el => el.getItemAttribute(channel))), maxMid = "min" === align ? (0, 
    vutils_1.minInArray)(middleValues) : (0, vutils_1.maxInArray)(middleValues);
    return (0, vutils_1.isValidNumber)(maxMid) && upstreamData.forEach(((el, index) => {
        const offset = maxMid - middleValues[index];
        hasRangeValue ? el.setItemAttributes({
            [baseChannel]: el.getItemAttribute(baseChannel) + offset,
            [channel]: el.getItemAttribute(channel) + offset
        }) : el.setItemAttributes({
            [channel]: el.getItemAttribute(channel) + offset
        });
    })), upstreamData;
}, symmetry = (options, upstreamData) => {
    var _a, _b;
    return upstreamData && 0 !== upstreamData.length && (null === (_a = upstreamData[0]) || void 0 === _a ? void 0 : _a.mark) ? symmetryByChannel(upstreamData, null !== (_b = options.channel) && void 0 !== _b ? _b : "y", options.align) : upstreamData;
};

exports.symmetry = symmetry;
//# sourceMappingURL=symmetry.js.map
