"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vgrammar_util_1 = require("@visactor/vgrammar-util"), vutils_1 = require("@visactor/vutils"), transform = (options, upstreamData) => {
    const sort = options.sort;
    if (sort && upstreamData) {
        const sortFn = (0, vutils_1.isFunction)(sort) ? sort : (0, vgrammar_util_1.compare)(sort.field, sort.order);
        upstreamData.sort(((a, b) => sortFn(a, b)));
    }
    return upstreamData;
};

exports.transform = transform;
//# sourceMappingURL=sort.js.map
