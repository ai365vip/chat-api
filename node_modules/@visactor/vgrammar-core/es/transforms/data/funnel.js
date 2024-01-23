import { isValidNumber } from "@visactor/vutils";

export const transform = (options, upstreamData) => {
    var _a, _b;
    const {field: field, asTransformRatio: asTransformRatio, asReachRatio: asReachRatio, asHeightRatio: asHeightRatio, asValueRatio: asValueRatio, asNextValueRatio: asNextValueRatio, asLastValueRatio: asLastValueRatio, asLastValue: asLastValue, asCurrentValue: asCurrentValue, asNextValue: asNextValue, heightVisual: heightVisual = !1, isCone: isCone = !0, range: range} = options, max = upstreamData.reduce(((m, d) => Math.max(m, Number.parseFloat(d[field]) || -1 / 0)), -1 / 0), min = upstreamData.reduce(((m, d) => Math.min(m, Number.parseFloat(d[field]) || 1 / 0)), 1 / 0), rangeArr = [ null !== (_a = null == range ? void 0 : range.min) && void 0 !== _a ? _a : min, null !== (_b = null == range ? void 0 : range.max) && void 0 !== _b ? _b : max ], data = upstreamData.map(((originDatum, index) => {
        var _a, _b;
        const datum = Object.assign({}, originDatum), currentValue = Number.parseFloat(datum[field]), lastValue = Number.parseFloat(null === (_a = upstreamData[index - 1]) || void 0 === _a ? void 0 : _a[field]), nextValue = Number.parseFloat(null === (_b = upstreamData[index + 1]) || void 0 === _b ? void 0 : _b[field]), transformRatio = isValidNumber(nextValue * currentValue) ? nextValue / currentValue : null, reachRatio = isValidNumber(currentValue * currentValue) ? currentValue / lastValue : null;
        return asLastValue && (datum[asLastValue] = lastValue), asNextValue && (datum[asNextValue] = nextValue), 
        asTransformRatio && (datum[asTransformRatio] = transformRatio), asReachRatio && (datum[asReachRatio] = 0 === index ? 1 : reachRatio), 
        asHeightRatio && (datum[asHeightRatio] = !0 === heightVisual ? transformRatio : 1 / upstreamData.length), 
        asValueRatio && (datum[asValueRatio] = currentValue / rangeArr[1]), asNextValueRatio && (datum[asNextValueRatio] = index === upstreamData.length - 1 ? isCone ? 0 : datum[asValueRatio] : nextValue / rangeArr[1]), 
        asLastValueRatio && (datum[asLastValueRatio] = 0 === index ? 1 : lastValue / rangeArr[1]), 
        asCurrentValue && (datum[asCurrentValue] = currentValue), datum;
    }));
    return data;
};
//# sourceMappingURL=funnel.js.map
