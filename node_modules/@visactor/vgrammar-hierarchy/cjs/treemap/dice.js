"use strict";

function default_1(parent, x0, y0, x1, y1, keyMap = {
    x0: "x0",
    x1: "x1",
    y0: "y0",
    y1: "y1"
}) {
    const nodes = parent.children;
    let node, i = -1;
    const n = nodes.length, k = parent.value && (x1 - x0) / parent.value;
    for (;++i < n; ) node = nodes[i], node[keyMap.y0] = y0, node[keyMap.y1] = y1, node[keyMap.x0] = x0, 
    node[keyMap.x1] = x0 += node.value * k;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = default_1;