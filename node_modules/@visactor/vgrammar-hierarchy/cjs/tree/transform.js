"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const format_1 = require("../format"), layout_1 = require("./layout"), transform = (options, upstreamData) => {
    const res = new layout_1.TreeLayout(options).layout(upstreamData, "width" in options ? {
        width: options.width,
        height: options.height
    } : {
        x0: options.x0,
        x1: options.x1,
        y0: options.y0,
        y1: options.y1
    });
    if (options.flatten) {
        const {maxDepth: maxDepth} = null != options ? options : {}, nodes = [];
        (0, format_1.flattenNodes)(res, nodes, {
            maxDepth: maxDepth
        });
        const links = [];
        return (0, format_1.flattenTreeLinks)(res, links, {
            maxDepth: maxDepth
        }), {
            nodes: nodes,
            links: links
        };
    }
    return res;
};

exports.transform = transform;
//# sourceMappingURL=transform.js.map