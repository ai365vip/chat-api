"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.findDataInFields = exports.mapValues = exports.dimensionTree = void 0;

const dimensionTree = (data, op) => {
    if (!op.fields) return data;
    const dimensionValues = {};
    return {
        dimensionValues: dimensionValues,
        dimensionData: groups(data.map((d => d.latestData)).flat(), op.fields, dimensionValues)
    };
};

function groups(data, fields, dimensionValues) {
    if (0 === fields.length) return data;
    const first = fields[0], _rest = fields.slice(1);
    dimensionValues[first] = new Set;
    const grouped = groupBy(data, first, dimensionValues[first]);
    return _rest.length ? mapValues(grouped, ((value, key) => groups(value, _rest, dimensionValues))) : grouped;
}

function groupBy(data, field, set) {
    const groups = {};
    return data.forEach((d => {
        const key = d[field];
        groups[key] || (groups[key] = [], set.add(key)), groups[key].push(d);
    })), groups;
}

function mapValues(target, fn) {
    return Object.keys(target).reduce(((result, key) => (result[key] = fn(target[key], key), 
    result)), {});
}

function findDataInFields(data, fields) {
    if (0 === fields.length) return data;
    const first = fields[0], _rest = fields.slice(1);
    return void 0 !== data[first] ? findDataInFields(data[first], _rest) : void 0;
}

exports.dimensionTree = dimensionTree, exports.mapValues = mapValues, exports.findDataInFields = findDataInFields;
//# sourceMappingURL=dimension-data.js.map
