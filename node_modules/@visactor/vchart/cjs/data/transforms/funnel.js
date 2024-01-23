"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.funnelTransform = exports.funnel = void 0;

const vutils_1 = require("@visactor/vutils"), funnel = (originData, op) => {
    var _a, _b;
    const data = originData.map((datum => Object.assign({}, datum)));
    if (!data || 0 === data.length) return data;
    const {valueField: valueField, asTransformRatio: asTransformRatio, asReachRatio: asReachRatio, asHeightRatio: asHeightRatio, asValueRatio: asValueRatio, asNextValueRatio: asNextValueRatio, asLastValueRatio: asLastValueRatio, asLastValue: asLastValue, asCurrentValue: asCurrentValue, asNextValue: asNextValue, heightVisual: heightVisual = !1, isCone: isCone = !0, range: range} = op, max = data.reduce(((m, d) => Math.max(m, Number.parseFloat(d[valueField]) || -1 / 0)), -1 / 0), min = data.reduce(((m, d) => Math.min(m, Number.parseFloat(d[valueField]) || 1 / 0)), 1 / 0), rangeArr = [ null !== (_a = null == range ? void 0 : range.min) && void 0 !== _a ? _a : min, null !== (_b = null == range ? void 0 : range.max) && void 0 !== _b ? _b : max ];
    return data.forEach(((d, i) => {
        var _a, _b;
        const currentValue = Number.parseFloat(d[valueField]), lastValue = Number.parseFloat(null === (_a = data[i - 1]) || void 0 === _a ? void 0 : _a[valueField]), nextValue = Number.parseFloat(null === (_b = data[i + 1]) || void 0 === _b ? void 0 : _b[valueField]), transformRatio = (0, 
        vutils_1.isValidNumber)(nextValue * currentValue) && 0 !== currentValue ? nextValue / currentValue : 0, reachRatio = (0, 
        vutils_1.isValidNumber)(currentValue * lastValue) && 0 !== lastValue ? currentValue / lastValue : 0;
        asLastValue && (d[asLastValue] = lastValue), asNextValue && (d[asNextValue] = nextValue), 
        asTransformRatio && (d[asTransformRatio] = transformRatio), asReachRatio && (d[asReachRatio] = 0 === i ? 1 : reachRatio), 
        asHeightRatio && (d[asHeightRatio] = !0 === heightVisual ? transformRatio : 1 / data.length), 
        asValueRatio && (d[asValueRatio] = currentValue / rangeArr[1]), asNextValueRatio && (d[asNextValueRatio] = i === data.length - 1 ? isCone ? 0 : d[asValueRatio] : nextValue / rangeArr[1]), 
        asLastValueRatio && (d[asLastValueRatio] = 0 === i ? 1 : lastValue / rangeArr[1]), 
        asCurrentValue && (d[asCurrentValue] = currentValue);
    })), data;
};

exports.funnel = funnel;

const funnelTransform = (originData, op) => {
    var _a, _b;
    const data = null === (_b = null === (_a = originData[0]) || void 0 === _a ? void 0 : _a.latestData) || void 0 === _b ? void 0 : _b.map((datum => Object.assign({}, datum)));
    return data && 0 !== data.length ? (data.shift(), data.forEach((d => {
        d[op.asIsTransformLevel] = !0;
    })), data) : data;
};

exports.funnelTransform = funnelTransform;
//# sourceMappingURL=funnel.js.map
