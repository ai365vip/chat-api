import { flattenNodes, flattenTreeLinks } from "../format";

import { TreeLayout } from "./layout";

export const transform = (options, upstreamData) => {
    const res = new TreeLayout(options).layout(upstreamData, "width" in options ? {
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
        flattenNodes(res, nodes, {
            maxDepth: maxDepth
        });
        const links = [];
        return flattenTreeLinks(res, links, {
            maxDepth: maxDepth
        }), {
            nodes: nodes,
            links: links
        };
    }
    return res;
};
//# sourceMappingURL=transform.js.map