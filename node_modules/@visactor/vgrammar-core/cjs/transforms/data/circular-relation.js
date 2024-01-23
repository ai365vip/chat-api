"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), vgrammar_util_1 = require("@visactor/vgrammar-util"), transform = (options, upstreamData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    if (!upstreamData || 0 === upstreamData.length) return [];
    const viewBox = (0, vgrammar_util_1.parseViewBox)(options), startAngle = null !== (_a = options.startAngle) && void 0 !== _a ? _a : 0, endAngle = null !== (_b = options.endAngle) && void 0 !== _b ? _b : 2 * Math.PI, maxRadius = Math.max(viewBox.width / 2, viewBox.height / 2), innerRadius = (0, 
    vgrammar_util_1.toPercent)(null !== (_c = options.innerRadius) && void 0 !== _c ? _c : 0, maxRadius), outerRadius = (0, 
    vgrammar_util_1.toPercent)(options.outerRadius, maxRadius), center = [ (0, vutils_1.isNumber)(null === (_d = options.center) || void 0 === _d ? void 0 : _d[0]) ? options.center[0] : viewBox.x0 + (0, 
    vgrammar_util_1.toPercent)(null !== (_f = null === (_e = options.center) || void 0 === _e ? void 0 : _e[0]) && void 0 !== _f ? _f : "50%", viewBox.width), (0, 
    vutils_1.isNumber)(null === (_g = options.center) || void 0 === _g ? void 0 : _g[1]) ? options.center[1] : viewBox.y0 + (0, 
    vgrammar_util_1.toPercent)(null !== (_j = null === (_h = options.center) || void 0 === _h ? void 0 : _h[1]) && void 0 !== _j ? _j : "50%", viewBox.height) ], fieldAccessor = (0, 
    vgrammar_util_1.field)(options.field), values = upstreamData.map(fieldAccessor), [min, max] = (0, 
    vgrammar_util_1.extent)(values), radiusScale = min === max ? val => (innerRadius + outerRadius) / 2 : val => innerRadius + (outerRadius - innerRadius) * (val - min) / (max - min), sizeAccessor = (0, 
    vutils_1.isNil)(options.radiusField) ? fieldAccessor : (0, vgrammar_util_1.field)(options.radiusField), defaultSize = null !== (_l = null === (_k = null == options ? void 0 : options.radiusRange) || void 0 === _k ? void 0 : _k[1]) && void 0 !== _l ? _l : 5;
    let sizeScale = datum => defaultSize;
    if (sizeAccessor) {
        const [minSize, maxSize] = sizeAccessor !== fieldAccessor ? (0, vgrammar_util_1.extent)(upstreamData.map(sizeAccessor)) : [ min, max ], minR = null !== (_o = null === (_m = options.radiusRange) || void 0 === _m ? void 0 : _m[0]) && void 0 !== _o ? _o : 5, maxR = null !== (_q = null === (_p = options.radiusRange) || void 0 === _p ? void 0 : _p[1]) && void 0 !== _q ? _q : 5;
        minSize !== maxSize && (sizeScale = datum => minR + (maxR - minR) * (sizeAccessor(datum) - minSize) / (maxSize - minSize));
    }
    const minAngle = Math.min(startAngle, endAngle), maxAngle = Math.max(startAngle, endAngle), angles = getPartialAngles(minAngle, maxAngle, upstreamData.length), res = [], searchAngle = (maxAngle - minAngle) / 60;
    return upstreamData.forEach(((datum, index) => {
        const radius = radiusScale(values[index]), size = sizeScale(datum);
        let x, y, angle = angles[index];
        for (let i = 0; i < 60 && (x = center[0] + radius * Math.cos(angle), y = center[1] + radius * Math.sin(angle), 
        hasOverlap({
            x: x,
            y: y,
            radius: size
        }, res) || x - size < viewBox.x0 || x + size > viewBox.x1 || y - size < viewBox.y0 || y + size > viewBox.y1); i++) i < 59 && (angle += searchAngle, 
        angle > maxAngle ? angle = minAngle : angle < minAngle && (angle = maxAngle));
        res.push({
            x: x,
            y: y,
            radius: size,
            datum: datum
        });
    })), res;
};

exports.transform = transform;

const getPartialAngles = (minAngle, maxAngle, count) => {
    let offsetAngle = 0, stepCount = Math.max(Math.ceil(2 * (maxAngle - minAngle) / Math.PI), 2), stepAngle = (maxAngle - minAngle) / stepCount, stepIndex = 0, stepSign = 1, i = 0, j = 0;
    const res = [];
    let startAngle = minAngle;
    for (;i < count; ) j < stepCount && (res.push(startAngle + (j % 2 ? Math.floor(j / 2) + Math.floor(stepCount / 2) : j / 2) * stepAngle * stepSign), 
    j++), i++, j === stepCount && (j = 0, stepIndex += 1, stepSign *= -1, 0 === offsetAngle ? offsetAngle = stepAngle / 2 : offsetAngle /= 2, 
    startAngle = -1 === stepSign ? maxAngle - offsetAngle : minAngle + offsetAngle, 
    stepIndex >= 2 && (stepAngle /= 2, stepCount *= 2));
    return res;
}, hasOverlap = (item, arr) => !(!arr || !arr.length) && arr.some((entry => Math.pow(item.x - entry.x, 2) + Math.pow(item.y - entry.y, 2) < Math.pow(item.radius + entry.radius, 2)));
//# sourceMappingURL=circular-relation.js.map
