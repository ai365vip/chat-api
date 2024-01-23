"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.extent = void 0;

const vutils_1 = require("@visactor/vutils"), extent = (array, func) => {
    const valueGetter = (0, vutils_1.isFunction)(func) ? func : val => val;
    let min, max;
    if (array && array.length) {
        const n = array.length;
        for (let i = 0; i < n; i += 1) {
            let value = valueGetter(array[i]);
            (0, vutils_1.isNil)(value) || !(0, vutils_1.isNumber)(value = +value) || Number.isNaN(value) || ((0, 
            vutils_1.isNil)(min) ? (min = value, max = value) : (min = Math.min(min, value), 
            max = Math.max(max, value)));
        }
        return [ min, max ];
    }
    return [ min, max ];
};

exports.extent = extent;
//# sourceMappingURL=extent.js.map