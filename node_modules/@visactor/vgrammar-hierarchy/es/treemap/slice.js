export default function(parent, x0, y0, x1, y1) {
    const nodes = parent.children;
    let node, i = -1;
    const n = nodes.length, k = parent.value && (y1 - y0) / parent.value;
    for (;++i < n; ) node = nodes[i], node.x0 = x0, node.x1 = x1, node.y0 = y0, y0 += node.value * k, 
    node.y1 = y0;
}
//# sourceMappingURL=slice.js.map