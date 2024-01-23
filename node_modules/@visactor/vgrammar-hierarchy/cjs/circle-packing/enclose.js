"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.packEncloseRandom = void 0;

const vutils_1 = require("@visactor/vutils"), lcg_1 = require("../lcg");

function default_1(circles) {
    return packEncloseRandom(circles, (0, lcg_1.randomLCG)());
}

function packEncloseRandom(circles, random) {
    let i = 0;
    const sCircles = (0, vutils_1.shuffleArray)(Array.from(circles), random), n = sCircles.length;
    let p, e, B = [];
    for (;i < n; ) p = sCircles[i], e && enclosesWeak(e, p) ? ++i : (B = extendBasis(B, p), 
    e = encloseBasis(B), i = 0);
    return e;
}

function extendBasis(B, p) {
    let i, j;
    if (enclosesWeakAll(p, B)) return [ p ];
    for (i = 0; i < B.length; ++i) if (enclosesNot(p, B[i]) && enclosesWeakAll(encloseBasis2(B[i], p), B)) return [ B[i], p ];
    for (i = 0; i < B.length - 1; ++i) for (j = i + 1; j < B.length; ++j) if (enclosesNot(encloseBasis2(B[i], B[j]), p) && enclosesNot(encloseBasis2(B[i], p), B[j]) && enclosesNot(encloseBasis2(B[j], p), B[i]) && enclosesWeakAll(encloseBasis3(B[i], B[j], p), B)) return [ B[i], B[j], p ];
    vutils_1.Logger.getInstance().error("error when packEncloseRandom");
}

function enclosesNot(a, b) {
    const dr = a.radius - b.radius, dx = b.x - a.x, dy = b.y - a.y;
    return dr < 0 || dr * dr < dx * dx + dy * dy;
}

function enclosesWeak(a, b) {
    const dr = a.radius - b.radius + 1e-9 * Math.max(a.radius, b.radius, 1), dx = b.x - a.x, dy = b.y - a.y;
    return dr > 0 && dr * dr > dx * dx + dy * dy;
}

function enclosesWeakAll(a, B) {
    for (let i = 0; i < B.length; ++i) if (!enclosesWeak(a, B[i])) return !1;
    return !0;
}

function encloseBasis(B) {
    switch (B.length) {
      case 1:
        return encloseBasis1(B[0]);

      case 2:
        return encloseBasis2(B[0], B[1]);

      case 3:
        return encloseBasis3(B[0], B[1], B[2]);
    }
}

function encloseBasis1(a) {
    return {
        x: a.x,
        y: a.y,
        radius: a.radius
    };
}

function encloseBasis2(a, b) {
    const x1 = a.x, y1 = a.y, r1 = a.radius, x2 = b.x, y2 = b.y, r2 = b.radius, x21 = x2 - x1, y21 = y2 - y1, r21 = r2 - r1, l = Math.sqrt(x21 * x21 + y21 * y21);
    return {
        x: (x1 + x2 + x21 / l * r21) / 2,
        y: (y1 + y2 + y21 / l * r21) / 2,
        radius: (l + r1 + r2) / 2
    };
}

function encloseBasis3(a, b, c) {
    const x1 = a.x, y1 = a.y, r1 = a.radius, x2 = b.x, y2 = b.y, r2 = b.radius, x3 = c.x, y3 = c.y, r3 = c.radius, a2 = x1 - x2, a3 = x1 - x3, b2 = y1 - y2, b3 = y1 - y3, c2 = r2 - r1, c3 = r3 - r1, d1 = x1 * x1 + y1 * y1 - r1 * r1, d2 = d1 - x2 * x2 - y2 * y2 + r2 * r2, d3 = d1 - x3 * x3 - y3 * y3 + r3 * r3, ab = a3 * b2 - a2 * b3, xa = (b2 * d3 - b3 * d2) / (2 * ab) - x1, xb = (b3 * c2 - b2 * c3) / ab, ya = (a3 * d2 - a2 * d3) / (2 * ab) - y1, yb = (a2 * c3 - a3 * c2) / ab, A = xb * xb + yb * yb - 1, B = 2 * (r1 + xa * xb + ya * yb), C = xa * xa + ya * ya - r1 * r1, r = -(Math.abs(A) > 1e-6 ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B);
    return {
        x: x1 + xa + xb * r,
        y: y1 + ya + yb * r,
        radius: r
    };
}

//# sourceMappingURL=enclose.js.map
exports.default = default_1, exports.packEncloseRandom = packEncloseRandom;