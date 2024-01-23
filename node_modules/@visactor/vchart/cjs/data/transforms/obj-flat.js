"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.objFlat = void 0;

const objFlat = (data, op) => {
    var _a;
    const dataCollect = (null === (_a = data[0]) || void 0 === _a ? void 0 : _a.latestData) ? data[0].latestData : data || [], result = [];
    return dataCollect.forEach((datum => {
        const dataKey = {};
        for (const key in datum) key !== op && (dataKey[key] = datum[key]);
        const dataOp = datum[op];
        null == dataOp || dataOp.forEach((d => {
            result.push(Object.assign({}, dataKey, d));
        }));
    })), result;
};

exports.objFlat = objFlat;
//# sourceMappingURL=obj-flat.js.map
