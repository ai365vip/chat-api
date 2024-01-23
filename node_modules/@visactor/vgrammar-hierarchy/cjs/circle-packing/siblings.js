"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.packSiblingsRandom = void 0;

const vutils_1 = require("@visactor/vutils"), lcg_1 = require("../lcg"), enclose_1 = require("./enclose");

function place(b, a, c) {
    const dx = b.x - a.x;
    let x, a2;
    const dy = b.y - a.y;
    let y, b2;
    const d2 = dx * dx + dy * dy;
    d2 ? (a2 = a.radius + c.radius, a2 *= a2, b2 = b.radius + c.radius, b2 *= b2, a2 > b2 ? (x = (d2 + b2 - a2) / (2 * d2), 
    y = Math.sqrt(Math.max(0, b2 / d2 - x * x)), c.x = b.x - x * dx - y * dy, c.y = b.y - x * dy + y * dx) : (x = (d2 + a2 - b2) / (2 * d2), 
    y = Math.sqrt(Math.max(0, a2 / d2 - x * x)), c.x = a.x + x * dx - y * dy, c.y = a.y + x * dy + y * dx)) : (c.x = a.x + c.radius, 
    c.y = a.y);
}

function intersects(a, b) {
    const dr = a.radius + b.radius - 1e-6, dx = b.x - a.x, dy = b.y - a.y;
    return dr > 0 && dr * dr > dx * dx + dy * dy;
}

function score(node) {
    const a = node._, b = node.next._, ab = a.radius + b.radius, dx = (a.x * b.radius + b.x * a.radius) / ab, dy = (a.y * b.radius + b.y * a.radius) / ab;
    return dx * dx + dy * dy;
}

function getCicleNode(circle) {
    return {
        _: circle,
        next: null,
        prev: null
    };
}

function packSiblingsRandom(circles, random) {
    const n = (circles = (0, vutils_1.array)(circles)).length;
    if (!n) return 0;
    let a = circles[0];
    if (a.x = 0, a.y = 0, 1 === n) return a.radius;
    const b = circles[1];
    if (a.x = -b.radius, b.x = a.radius, b.y = 0, 2 === n) return a.radius + b.radius;
    let c = circles[2];
    place(b, a, c);
    let j, k, sj, sk, aa, ca, isContinue, aNode = getCicleNode(a), bNode = getCicleNode(b), cNode = getCicleNode(c);
    aNode.next = bNode, cNode.prev = bNode, bNode.next = cNode, aNode.prev = cNode, 
    cNode.next = aNode, bNode.prev = aNode;
    for (let i = 3; i < n; ++i) {
        isContinue = !1, c = circles[i], place(aNode._, bNode._, c), cNode = getCicleNode(c), 
        j = bNode.next, k = aNode.prev, sj = bNode._.radius, sk = aNode._.radius;
        do {
            if (sj <= sk) {
                if (intersects(j._, cNode._)) {
                    bNode = j, aNode.next = bNode, bNode.prev = aNode, --i, isContinue = !0;
                    break;
                }
                sj += j._.radius, j = j.next;
            } else {
                if (intersects(k._, cNode._)) {
                    aNode = k, aNode.next = bNode, bNode.prev = aNode, --i, isContinue = !0;
                    break;
                }
                sk += k._.radius, k = k.prev;
            }
        } while (j !== k.next);
        if (!isContinue) {
            for (cNode.prev = aNode, cNode.next = bNode, aNode.next = bNode.prev = bNode = cNode, 
            aa = score(aNode), cNode = cNode.next; cNode !== bNode; ) ca = score(cNode), ca < aa && (aNode = cNode, 
            aa = ca), cNode = cNode.next;
            bNode = aNode.next;
        }
    }
    const aCircles = [ bNode._ ];
    for (cNode = bNode.next; cNode !== bNode; ) aCircles.push(cNode._), cNode = cNode.next;
    c = (0, enclose_1.packEncloseRandom)(aCircles, random);
    for (let i = 0; i < n; ++i) a = circles[i], a.x -= c.x, a.y -= c.y;
    return c.radius;
}

function default_1(circles) {
    return packSiblingsRandom(circles, (0, lcg_1.randomLCG)()), circles;
}

exports.packSiblingsRandom = packSiblingsRandom, exports.default = default_1;
//# sourceMappingURL=siblings.js.map