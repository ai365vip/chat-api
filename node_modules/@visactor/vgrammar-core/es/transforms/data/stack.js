import { field } from "@visactor/vgrammar-util";

import { groupData } from "../../graph/mark/differ";

const stack = (options, data) => {
    var _a;
    const positiveValues = new Map, negativeValues = new Map, offset = null !== (_a = options.offset) && void 0 !== _a ? _a : "diverging";
    return data.map((datum => {
        var _a;
        const dimension = datum[options.dimensionField], stackValue = "diverging" === offset ? datum[options.stackField] : Math.abs(datum[options.stackField]), map = stackValue >= 0 ? positiveValues : negativeValues, lastValue = null !== (_a = map.get(dimension)) && void 0 !== _a ? _a : 0, value = stackValue + lastValue;
        return map.set(dimension, value), {
            dimension: dimension,
            value: stackValue,
            stack: value,
            prevStack: lastValue,
            datum: datum
        };
    }));
}, silhouetteOffset = (options, data) => {
    if (!data || 0 === data.length) return data;
    const groupedData = groupData(data, field("dimension"));
    return groupedData.keys.forEach((key => {
        const dimensionData = groupedData.data.get(key);
        if (!dimensionData || dimensionData.length <= 0) return 0;
        const g0 = -dimensionData.reduce(((sum, entry) => sum + entry.value), 0) / 2;
        dimensionData.forEach((datum => {
            datum.stack = datum.stack + g0, datum.prevStack = datum.prevStack + g0;
        }));
    })), data;
}, wiggleOffset = (options, data) => {
    if (!data || 0 === data.length) return data;
    const groupedData = groupData(data, field("dimension"));
    return groupedData.keys.forEach((key => {
        const dimensionData = groupedData.data.get(key);
        if (!dimensionData || dimensionData.length <= 0) return 0;
        const n = dimensionData.length, g0 = -1 / (n + 1) * dimensionData.reduce(((sum, entry, i) => entry.value * (n - i + 1)), 0);
        dimensionData.forEach((datum => {
            datum.stack = datum.stack + g0, datum.prevStack = datum.prevStack + g0;
        }));
    })), data;
}, setFields = (options, data) => {
    if (!(options.asPercentStack || options.asPrevPercentStack || options.asPercent || options.asSum)) return data.map((entry => {
        var _a;
        const {stack: stack, prevStack: prevStack, datum: datum} = entry, newDatum = Object.assign({}, datum);
        return newDatum[null !== (_a = options.asStack) && void 0 !== _a ? _a : options.stackField] = stack, 
        options.asPrevStack && (newDatum[options.asPrevStack] = prevStack), newDatum;
    }));
    const positiveSums = new Map, negativeSums = new Map;
    return data.forEach((entry => {
        var _a;
        const {dimension: dimension, value: value} = entry, map = value >= 0 ? positiveSums : negativeSums;
        map.set(dimension, (null !== (_a = map.get(dimension)) && void 0 !== _a ? _a : 0) + value);
    })), data.map((entry => {
        var _a, _b;
        const {dimension: dimension, value: value, stack: stack, prevStack: prevStack, datum: datum} = entry, newDatum = Object.assign({}, datum), sum = null !== (_a = (value >= 0 ? positiveSums : negativeSums).get(dimension)) && void 0 !== _a ? _a : 0;
        return newDatum[null !== (_b = options.asStack) && void 0 !== _b ? _b : options.stackField] = stack, 
        options.asPrevStack && (newDatum[options.asPrevStack] = prevStack), options.asSum && (newDatum[options.asSum] = sum), 
        options.asPercent && (newDatum[options.asPercent] = 0 === sum ? 0 : value / sum), 
        options.asPercentStack && (newDatum[options.asPercentStack] = 0 === sum ? 0 : stack / sum), 
        options.asPrevPercentStack && (newDatum[options.asPrevPercentStack] = 0 === sum ? 0 : prevStack / sum), 
        newDatum;
    }));
};

export const transform = (options, upstreamData) => {
    var _a;
    const offset = null !== (_a = options.offset) && void 0 !== _a ? _a : "diverging", data = "negative" === options.order ? upstreamData.slice().reverse() : upstreamData, stackedValues = stack(options, data);
    "silhouette" === offset ? silhouetteOffset(0, stackedValues) : "wiggle" === offset && wiggleOffset(0, stackedValues);
    const output = setFields(options, stackedValues);
    return "negative" === options.order ? output.reverse() : output;
};
//# sourceMappingURL=stack.js.map
