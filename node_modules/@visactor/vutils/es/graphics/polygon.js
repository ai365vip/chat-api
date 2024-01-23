import { isIntersect } from "./algorithm";

const EPSILON = 1e-8;

export function lineIntersectPolygon(a1x, a1y, a2x, a2y, points) {
    for (let i = 0, p2 = points[points.length - 1]; i < points.length; i++) {
        const p = points[i];
        if (isIntersect([ a1x, a1y ], [ a2x, a2y ], [ p.x, p.y ], [ p2.x, p2.y ])) return !0;
        p2 = p;
    }
    return !1;
}

export function polygonContainPoint(points, x, y) {
    let w = 0, p = points[0];
    if (!p) return !1;
    for (let i = 1; i < points.length; i++) {
        const p2 = points[i];
        w += isPointInLine(p.x, p.y, p2.x, p2.y, x, y), p = p2;
    }
    const p0 = points[0];
    return isAroundEqual(p.x, p0.x) && isAroundEqual(p.y, p0.y) || (w += isPointInLine(p.x, p.y, p0.x, p0.y, x, y)), 
    0 !== w;
}

export function isPointInLine(x0, y0, x1, y1, x, y) {
    if (y > y0 && y > y1 || y < y0 && y < y1) return 0;
    if (y1 === y0) return 0;
    const t = (y - y0) / (y1 - y0);
    let dir = y1 < y0 ? 1 : -1;
    1 !== t && 0 !== t || (dir = y1 < y0 ? .5 : -.5);
    const x_ = t * (x1 - x0) + x0;
    return x_ === x ? 1 / 0 : x_ > x ? dir : 0;
}

function isAroundEqual(a, b) {
    return Math.abs(a - b) < EPSILON;
}

export function polygonIntersectPolygon(pointsA, pointsB) {
    for (let i = 0; i < pointsB.length; i++) {
        if (polygonContainPoint(pointsA, pointsB[i].x, pointsB[i].y)) return !0;
        if (i > 0 && lineIntersectPolygon(pointsB[i - 1].x, pointsB[i - 1].y, pointsB[i].x, pointsB[i].y, pointsA)) return !0;
    }
    return !1;
}
//# sourceMappingURL=polygon.js.map
