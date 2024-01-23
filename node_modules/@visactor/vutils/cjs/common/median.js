"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.median = void 0;

const ascending_1 = require("./ascending"), quantileSorted_1 = require("./quantileSorted"), median = (values, isSorted) => {
    let sorted = values;
    return !0 !== isSorted && (sorted = values.sort(ascending_1.ascending)), (0, quantileSorted_1.quantileSorted)(sorted, .5);
};

exports.median = median;
//# sourceMappingURL=median.js.map
