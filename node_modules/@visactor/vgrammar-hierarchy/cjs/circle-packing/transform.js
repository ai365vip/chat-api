"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const format_1 = require("../format"), layout_1 = require("./layout"), transform = (options, upstreamData) => {
    const res = new layout_1.CirclePackingLayout(options).layout(upstreamData, "width" in options ? {
        width: options.width,
        height: options.height
    } : {
        x0: options.x0,
        x1: options.x1,
        y0: options.y0,
        y1: options.y1
    });
    if (options.flatten) {
        const nodes = [];
        return (0, format_1.flattenNodes)(res, nodes, {
            maxDepth: null == options ? void 0 : options.maxDepth
        }), nodes;
    }
    return res;
};

exports.transform = transform;
//# sourceMappingURL=transform.js.map