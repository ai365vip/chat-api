"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), transform = (options, upstreamData, params) => {
    const func = options.callback, as = options.as;
    if (!options.all) return upstreamData.forEach((entry => {
        const data = func(entry, params);
        if (!(0, vutils_1.isNil)(as)) {
            if ((0, vutils_1.isNil)(entry)) return;
            entry[as] = data;
        }
        return data;
    })), upstreamData;
    const data = func(upstreamData, params);
    return (0, vutils_1.isNil)(as) || (0, vutils_1.isNil)(upstreamData) ? data : (upstreamData[as] = data, 
    upstreamData);
};

exports.transform = transform;
//# sourceMappingURL=map.js.map
