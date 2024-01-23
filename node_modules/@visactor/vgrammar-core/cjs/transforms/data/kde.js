"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), defaultBins = 256, defaultAs = [ "x", "kde" ], defaultAs2d = [ "x", "y", "kde" ], SQRT2PI = Math.sqrt(2 * Math.PI), SQRT2PI2 = Math.sqrt((2 * Math.PI) ** 2), gaussKernel = (x, dimension = 1) => {
    const sp = 1 === dimension ? SQRT2PI : 2 === dimension ? SQRT2PI2 : Math.sqrt((2 * Math.PI) ** dimension);
    return Math.exp(-(x ** 2) / 2) / sp;
}, ruleOfThumbBandwidth = (data, dimension = 1) => {
    const n = data.length, mean = data.reduce(((sum, datum) => sum + datum.x), 0) / n, sd = Math.sqrt(data.reduce(((v, datum) => v + (datum.x - mean) ** 2), 0) / n), sortedData = data.sort(((a, b) => a.x - b.x)).map((datum => datum.x)), q1 = (0, 
    vutils_1.quantileSorted)(sortedData, .25), iqr = (0, vutils_1.quantileSorted)(sortedData, .75) - q1;
    return .9 * Math.min(sd, iqr / 1.34) * n ** -.2;
}, scottBandwidth = (data, dimension = 1) => data.length ** (-1 / (dimension + 4)), kde1d = (targetDatum, data, bandwidth) => {
    const n = data.length;
    return data.reduce(((v, datum) => {
        const distance = Math.abs(targetDatum.x - datum.x);
        return v + gaussKernel(distance / bandwidth, 1);
    }), 0) / (n * bandwidth);
}, kde2d = (targetDatum, data, bandwidth) => {
    const n = data.length;
    return data.reduce(((v, datum) => {
        const distance = vutils_1.PointService.distancePP(targetDatum, datum);
        return v + gaussKernel(distance / bandwidth ** 2, 1);
    }), 0) / (n * bandwidth ** 2);
}, transform = (options, upstreamData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    if (!upstreamData || 0 === upstreamData.length) return upstreamData;
    const dimension = null !== (_a = options.dimension) && void 0 !== _a ? _a : "1d", field = (0, 
    vutils_1.array)(options.field), bins = (0, vutils_1.array)(null !== (_b = options.bins) && void 0 !== _b ? _b : 256), as = (0, 
    vutils_1.array)(options.as);
    if ("1d" === dimension) {
        const data = upstreamData.map((datum => ({
            x: datum[field[0]]
        }))), bandwidth = null !== (_c = options.bandwidth) && void 0 !== _c ? _c : ruleOfThumbBandwidth(data), min = data.reduce(((min, datum) => Math.min(min, datum.x)), data[0].x), max = data.reduce(((max, datum) => Math.max(max, datum.x)), data[0].x), extentMin = null !== (_e = null === (_d = options.extent) || void 0 === _d ? void 0 : _d[0]) && void 0 !== _e ? _e : min, extentMax = null !== (_g = null === (_f = options.extent) || void 0 === _f ? void 0 : _f[1]) && void 0 !== _g ? _g : max, extent = [ (0, 
        vutils_1.isNumber)(extentMin) ? extentMin : null !== (_h = extentMin.x) && void 0 !== _h ? _h : min, (0, 
        vutils_1.isNumber)(extentMax) ? extentMax : null !== (_j = extentMax.x) && void 0 !== _j ? _j : max ], step = (extent[1] - extent[0]) / bins[0], kdeResult = new Array(bins[0]).fill(0).map(((v, index) => {
            var _a, _b;
            const value = Math.min(extent[0] + step * (index + .5), extent[1]);
            return {
                [null !== (_a = as[0]) && void 0 !== _a ? _a : defaultAs[0]]: value,
                [null !== (_b = as[1]) && void 0 !== _b ? _b : defaultAs[0]]: kde1d({
                    x: value
                }, data, bandwidth)
            };
        }));
        return kdeResult;
    }
    if ("2d" === dimension) {
        const data = upstreamData.map((datum => ({
            x: datum[field[0]],
            y: datum[field[1]]
        }))), bandwidth = options.bandwidth || scottBandwidth(data, 2), min = data.reduce(((min, datum) => ({
            x: Math.min(min.x, datum.x),
            y: Math.min(min.y, datum.y)
        })), data[0]), max = data.reduce(((max, datum) => ({
            x: Math.max(max.x, datum.x),
            y: Math.max(max.y, datum.y)
        })), data[0]), extentMin = null !== (_l = null === (_k = options.extent) || void 0 === _k ? void 0 : _k[0]) && void 0 !== _l ? _l : min, extentMax = null !== (_o = null === (_m = options.extent) || void 0 === _m ? void 0 : _m[1]) && void 0 !== _o ? _o : max, extent = [ (0, 
        vutils_1.isNumber)(extentMin) ? {
            x: extentMin,
            y: extentMin
        } : {
            x: null !== (_p = extentMin.x) && void 0 !== _p ? _p : min.x,
            y: null !== (_q = extentMin.y) && void 0 !== _q ? _q : min.y
        }, (0, vutils_1.isNumber)(extentMax) ? {
            x: extentMax,
            y: extentMax
        } : {
            x: null !== (_r = extentMax.x) && void 0 !== _r ? _r : max.x,
            y: null !== (_s = extentMax.y) && void 0 !== _s ? _s : max.y
        } ], binsX = bins[0], binsY = null !== (_t = bins[1]) && void 0 !== _t ? _t : bins[0], stepX = (extent[1].x - extent[0].x) / binsX, stepY = (extent[1].y - extent[0].y) / binsY, kdeResult = [];
        for (let yIndex = 0; yIndex < binsY; yIndex++) for (let xIndex = 0; xIndex < binsX; xIndex++) {
            const x = Math.min(extent[0].x + stepX * (xIndex + .5), extent[1].x), y = Math.min(extent[0].y + stepY * (yIndex + .5), extent[1].y);
            kdeResult.push({
                [null !== (_u = as[0]) && void 0 !== _u ? _u : defaultAs2d[0]]: x,
                [null !== (_v = as[1]) && void 0 !== _v ? _v : defaultAs2d[1]]: y,
                [null !== (_w = as[2]) && void 0 !== _w ? _w : defaultAs2d[2]]: kde2d({
                    x: x,
                    y: y
                }, data, bandwidth)
            });
        }
        return kdeResult;
    }
    return [];
};

exports.transform = transform;
//# sourceMappingURL=kde.js.map
