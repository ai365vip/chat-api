"use strict";

function default_1(parent, x0, y0, x1, y1) {
    const nodes = parent.children;
    let node, i = -1;
    const n = nodes.length, k = parent.value && (y1 - y0) / parent.value;
    for (;++i < n; ) node = nodes[i], node.x0 = x0, node.x1 = x1, node.y0 = y0, y0 += node.value * k, 
    node.y1 = y0;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = default_1;
//# sourceMappingURL=slice.js.map