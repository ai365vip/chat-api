"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), aggregateFuncs = {
    sum: arr => arr.reduce(((sum, val) => sum + val), 0),
    min: arr => (0, vutils_1.minInArray)(arr),
    max: arr => (0, vutils_1.maxInArray)(arr),
    count: arr => arr.length,
    mean: arr => arr.reduce(((sum, val) => sum + val), 0) / arr.length
}, transform = (options, upstreamData) => {
    var _a;
    if (!upstreamData || !upstreamData.length) return [];
    const res = [], groups = {}, keyField = options.keyField, valueField = options.valueField, aggregate = aggregateFuncs[null !== (_a = options.aggregateType) && void 0 !== _a ? _a : "sum"];
    if (options.groupBy) {
        const groupByFields = (0, vutils_1.array)(options.groupBy);
        upstreamData.forEach((entry => {
            if (!entry) return;
            const datum = {}, keys = [];
            groupByFields.forEach((field => {
                datum[field] = entry[field], keys.push(entry[field]);
            }));
            const groupKey = keys.join("~");
            groups[groupKey] ? groups[groupKey].values[entry[keyField]] ? groups[groupKey].values[entry[keyField]].push(entry[valueField]) : groups[groupKey].values[entry[keyField]] = [ entry[valueField] ] : groups[groupKey] = {
                datum: datum,
                values: {
                    [entry[keyField]]: [ entry[valueField] ]
                }
            };
        }));
    } else groups[0] = {
        datum: {},
        values: {}
    }, upstreamData.forEach((entry => {
        entry && (groups[0].values[entry[keyField]] ? groups[0].values[entry[keyField]].push(entry[valueField]) : groups[0].values[entry[keyField]] = [ entry[valueField] ]);
    }));
    return Object.keys(groups).forEach((groupKey => {
        const datum = groups[groupKey].datum, values = groups[groupKey].values;
        Object.keys(values).forEach((key => {
            const rows = values[key];
            datum[key] = aggregate(rows);
        })), res.push(datum);
    })), res;
};

exports.transform = transform;
//# sourceMappingURL=unfold.js.map
