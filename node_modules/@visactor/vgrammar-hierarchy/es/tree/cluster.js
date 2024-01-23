import { isNumber } from "@visactor/vutils";

import { eachAfter } from "../utils";

function defaultSeparation(a, b) {
    return a.parentKey === b.parentKey ? 1 : 2;
}

function meanX(children) {
    return children.reduce(((x, c) => x + c.x), 0) / children.length;
}

function maxY(children) {
    return 1 + children.reduce(((y, c) => Math.max(y, c.y)), 0);
}

function leafLeft(node) {
    let children = node.children;
    for (;children; ) children = (node = children[0]).children;
    return node;
}

function leafRight(node) {
    let children = node.children;
    for (;children; ) children = (node = children[children.length - 1]).children;
    return node;
}

export function clusterTree(root, viewBox, minNodeGap, linkWidth, separation = defaultSeparation) {
    let previousNode, x = 0;
    if (eachAfter([ root ], (node => {
        const children = node.children;
        children ? (node.x = meanX(children), node.y = maxY(children)) : (node.x = previousNode ? x += separation(node, previousNode) : 0, 
        node.y = 0, previousNode = node);
    })), isNumber(minNodeGap) && isNumber(linkWidth)) eachAfter([ root ], (node => {
        node.x = viewBox.x0 + (node.x - root.x) * minNodeGap, node.y = viewBox.y0 + (root.y - node.y) * linkWidth;
    })); else {
        const left = leafLeft(root), right = leafRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2, kx = isNumber(minNodeGap) ? minNodeGap : viewBox.width / (x1 - x0);
        eachAfter([ root ], (node => {
            node.x = viewBox.x0 + (node.x - x0) * kx, node.y = viewBox.y0 + (1 - (root.y ? node.y / root.y : 1)) * viewBox.height;
        }));
    }
    return root;
}
//# sourceMappingURL=cluster.js.map