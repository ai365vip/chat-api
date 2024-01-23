import { flattenNodes } from "../format";

import { TreemapLayout } from "./layout";

export const transform = (options, upstreamData) => {
    const res = new TreemapLayout(options).layout(upstreamData, "width" in options ? {
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
        return flattenNodes(res, nodes, {
            maxDepth: null == options ? void 0 : options.maxDepth
        }), nodes;
    }
    return res;
};
//# sourceMappingURL=transform.js.map