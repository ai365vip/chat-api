import { isNil, isValidNumber, maxInArray, minInArray } from "@visactor/vutils";

const symmetryByChannel = (upstreamData, channel, align) => {
    const baseChannel = `${channel}1`, hasRangeValue = upstreamData.some((el => !isNil(el.getItemAttribute(baseChannel)))), middleValues = hasRangeValue ? upstreamData.map((el => (el.getItemAttribute(baseChannel) + el.getItemAttribute(channel)) / 2)) : upstreamData.map((el => el.getItemAttribute(channel))), maxMid = "min" === align ? minInArray(middleValues) : maxInArray(middleValues);
    return isValidNumber(maxMid) && upstreamData.forEach(((el, index) => {
        const offset = maxMid - middleValues[index];
        hasRangeValue ? el.setItemAttributes({
            [baseChannel]: el.getItemAttribute(baseChannel) + offset,
            [channel]: el.getItemAttribute(channel) + offset
        }) : el.setItemAttributes({
            [channel]: el.getItemAttribute(channel) + offset
        });
    })), upstreamData;
};

export const symmetry = (options, upstreamData) => {
    var _a, _b;
    return upstreamData && 0 !== upstreamData.length && (null === (_a = upstreamData[0]) || void 0 === _a ? void 0 : _a.mark) ? symmetryByChannel(upstreamData, null !== (_b = options.channel) && void 0 !== _b ? _b : "y", options.align) : upstreamData;
};
//# sourceMappingURL=symmetry.js.map
