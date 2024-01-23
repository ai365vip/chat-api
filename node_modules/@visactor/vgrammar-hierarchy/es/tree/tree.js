import { eachAfter, eachBefore } from "../utils";

import { isArray, isNumber } from "@visactor/vutils";

function defaultSeparation(a, b) {
    return a.parentKey === b.parentKey ? 1 : 2;
}

function nextLeft(v) {
    const children = v.children;
    return children ? children[0] : v.t;
}

function nextRight(v) {
    const children = v.children;
    return children ? children[children.length - 1] : v.t;
}

function moveSubtree(wm, wp, shift) {
    const change = shift / (wp.i - wm.i);
    wp.c -= change, wp.s += shift, wm.c += change, wp.z += shift, wp.m += shift;
}

function executeShifts(v) {
    let shift = 0, change = 0;
    const children = v.children;
    let w, i = children.length;
    for (;--i >= 0; ) w = children[i], w.z += shift, w.m += shift, shift += w.s + (change += w.c);
}

function nextAncestor(vim, v, ancestor) {
    var _a;
    const vimAncestor = null !== (_a = vim.a) && void 0 !== _a ? _a : vim;
    return vimAncestor.parent === v.parent ? vimAncestor : ancestor;
}

function createTreeNode(node, i) {
    return {
        _: node,
        i: i,
        parent: null,
        A: null,
        a: null,
        z: 0,
        m: 0,
        c: 0,
        s: 0,
        t: null
    };
}

function treeRoot(root) {
    const tree = createTreeNode(root, 0), nodes = [ tree ];
    let child, children, i, n, node = nodes.pop();
    for (;node; ) {
        if (children = node._.children, children) for (n = children.length, node.children = new Array(n), 
        i = n - 1; i >= 0; --i) child = createTreeNode(children[i], i), node.children[i] = child, 
        nodes.push(child), child.parent = node;
        node = nodes.pop();
    }
    return tree.parent = createTreeNode(null, 0), tree.parent.children = [ tree ], tree;
}

export function tidyTree(root, viewBox, minNodeGap, linkWidth, separation = defaultSeparation) {
    const apportion = (v, w, ancestor) => {
        if (w) {
            let shift, vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m;
            for (vim = nextRight(vim), vip = nextLeft(vip); vim && vip; ) vom = nextLeft(vom), 
            vop = nextRight(vop), vop.a = v, shift = vim.z + sim - vip.z - sip + separation(vim._, vip._), 
            shift > 0 && (moveSubtree(nextAncestor(vim, v, ancestor), v, shift), sip += shift, 
            sop += shift), sim += vim.m, sip += vip.m, som += vom.m, sop += vop.m, vim = nextRight(vim), 
            vip = nextLeft(vip);
            vim && !nextRight(vop) && (vop.t = vim, vop.m += sim - sop), vip && !nextLeft(vom) && (vom.t = vip, 
            vom.m += sip - som, ancestor = v);
        }
        return ancestor;
    }, t = treeRoot(root);
    let getY;
    if (eachAfter([ t ], (v => {
        const children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
        if (children) {
            executeShifts(v);
            const midpoint = (children[0].z + children[children.length - 1].z) / 2;
            w ? (v.z = w.z + separation(v._, w._), v.m = v.z - midpoint) : v.z = midpoint;
        } else w && (v.z = w.z + separation(v._, w._));
        v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
    })), t.parent.m = -t.z, eachBefore([ t ], (v => {
        v._.x = v.z + v.parent.m, v.m += v.parent.m;
    })), isNumber(linkWidth)) getY = node => node.depth * linkWidth; else if (isArray(linkWidth) && linkWidth.length) {
        const sumed = linkWidth.reduce(((res, entry, index) => (res[index] = 0 === index ? entry : res[index - 1] + entry, 
        res)), []);
        getY = node => {
            var _a;
            return null !== (_a = sumed[node.depth]) && void 0 !== _a ? _a : sumed[sumed.length - 1];
        };
    }
    if (isNumber(minNodeGap) && getY) {
        eachBefore([ root ], (node => {
            node.x = viewBox.x0 + viewBox.width / 2 + node.x * minNodeGap, node.y = viewBox.y0 + getY(node);
        }));
    } else {
        let left = root, right = root, bottom = root;
        eachBefore([ root ], (node => {
            node.x < left.x && (left = node), node.x > right.x && (right = node), node.depth > bottom.depth && (bottom = node);
        }));
        const s = left === right ? 1 : separation(left, right) / 2, tx = s - left.x, kx = isNumber(minNodeGap) ? minNodeGap : viewBox.width / (right.x + s + tx), ky = viewBox.height / (bottom.depth || 1);
        eachBefore([ root ], (node => {
            node.x = viewBox.x0 + (node.x + tx) * kx, node.y = viewBox.y0 + (getY ? getY(node) : node.depth * ky);
        }));
    }
    return root;
}
//# sourceMappingURL=tree.js.map