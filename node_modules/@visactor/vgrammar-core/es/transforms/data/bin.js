import { isValid } from "@visactor/vutils";

const defaultBins = 10;

export const transform = (options, upstreamData) => {
    if (!upstreamData || 0 === upstreamData.length) return upstreamData;
    const {extent: extent, step: step} = options, bins = isValid(options.bins) ? Math.max(options.bins, 1) : 10, range = extent[1] - extent[0], binStep = isValid(step) ? step : range / bins;
    return upstreamData.map((upstreamDatum => {
        var _a, _b, _c, _d;
        const datum = Object.assign({}, upstreamDatum), value = upstreamDatum[options.field], binIndex = Math.floor((value - extent[0]) / binStep), binStart = extent[0] + binIndex * binStep, binEnd = Math.min(extent[1], extent[0] + (binIndex + 1) * binStep);
        return datum[null !== (_b = null === (_a = options.as) || void 0 === _a ? void 0 : _a[0]) && void 0 !== _b ? _b : "binStart"] = binStart, 
        datum[null !== (_d = null === (_c = options.as) || void 0 === _c ? void 0 : _c[1]) && void 0 !== _d ? _d : "binEnd"] = binEnd, 
        datum;
    }));
};
//# sourceMappingURL=bin.js.map
