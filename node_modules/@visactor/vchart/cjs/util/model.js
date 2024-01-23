"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getFirstSeries = exports.getSeries = exports.eachSeries = void 0;

const type_1 = require("./type");

function eachSeries(regions, callback, filter) {
    let flag = !1;
    if (callback && (0, type_1.isFunction)(callback)) for (const r of regions) for (const s of r.getSeries(filter)) if (flag = !!callback.call(null, s), 
    flag) return flag;
    return flag;
}

function getSeries(regions, filter) {
    const result = [];
    for (const r of regions) for (const s of r.getSeries(filter)) result.push(s);
    return result;
}

exports.eachSeries = eachSeries, exports.getSeries = getSeries;

const getFirstSeries = (regions, coordinateType) => {
    for (let i = 0; i < regions.length; i++) {
        const series = regions[i].getSeries();
        for (let j = 0; j < series.length; j++) {
            const s = series[j];
            if (coordinateType && s && s.coordinate === coordinateType) return s;
            if (!coordinateType && s) return s;
        }
    }
    return null;
};

exports.getFirstSeries = getFirstSeries;
//# sourceMappingURL=model.js.map
