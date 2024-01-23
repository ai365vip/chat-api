export const flattenNodes = (nodes, output = [], options) => {
    const hasMaxDepth = (null == options ? void 0 : options.maxDepth) >= 0;
    return nodes.forEach((node => {
        (!hasMaxDepth || node.depth <= options.maxDepth) && (output.push((null == options ? void 0 : options.callback) ? options.callback(node) : node), 
        node.children && (hasMaxDepth && node.depth === options.maxDepth ? (node.children = null, 
        node.isLeaf = !0) : flattenNodes(node.children, output, options)));
    })), output;
};

export const flattenTreeLinks = (nodes, output = [], options) => {
    const hasMaxDepth = (null == options ? void 0 : options.maxDepth) >= 0;
    return nodes.forEach((node => {
        (!hasMaxDepth || node.depth <= options.maxDepth - 1) && node.children && node.children.forEach((child => {
            var _a;
            const link = {
                source: node,
                target: child,
                x0: node.x,
                y0: node.y,
                x1: child.x,
                y1: child.y,
                key: `${node.key}~${child.key}`
            };
            output.push((null == options ? void 0 : options.callback) ? options.callback(link) : link), 
            (null === (_a = child.children) || void 0 === _a ? void 0 : _a.length) && flattenTreeLinks([ child ], output, options);
        }));
    })), output;
};