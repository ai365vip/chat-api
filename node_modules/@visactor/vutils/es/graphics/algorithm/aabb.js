import { pointInRect } from "./intersect";

let x1, y1, x2, y2;

export function getAABBFromPoints(points) {
    return x1 = 1 / 0, y1 = 1 / 0, x2 = -1 / 0, y2 = -1 / 0, points.forEach((point => {
        x1 > point.x && (x1 = point.x), x2 < point.x && (x2 = point.x), y1 > point.y && (y1 = point.y), 
        y2 < point.y && (y2 = point.y);
    })), {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    };
}

export function pointInAABB(point, aabb) {
    return pointInRect(point, aabb, !1);
}

export function unionAABB(bounds1, bounds2, buffer = 3, format = !1) {
    let x11 = bounds1.x1, x12 = bounds1.x2, y11 = bounds1.y1, y12 = bounds1.y2, x21 = bounds2.x1, x22 = bounds2.x2, y21 = bounds2.y1, y22 = bounds2.y2;
    if (format) {
        let temp;
        x11 > x12 && (temp = x11, x11 = x12, x12 = temp), y11 > y12 && (temp = y11, y11 = y12, 
        y12 = temp), x21 > x22 && (temp = x21, x21 = x22, x22 = temp), y21 > y22 && (temp = y21, 
        y21 = y22, y22 = temp);
    }
    if (x11 >= x22 || x12 <= x21 || y11 >= y22 || y12 <= y21) return [ bounds1, bounds2 ];
    const area1 = (x12 - x11 + 2 * buffer) * (y12 - y11 + 2 * buffer), area2 = (x22 - x21 + 2 * buffer) * (y22 - y21 + 2 * buffer), x1 = Math.min(x11, x21), y1 = Math.min(y11, y21), x2 = Math.max(x12, x22), y2 = Math.max(y12, y22);
    return area1 + area2 > (x2 - x1) * (y2 - y1) ? [ {
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2
    } ] : [ bounds1, bounds2 ];
}

export function mergeAABB(boundsList) {
    const nextList = [];
    return function _merge(baseBound, list) {
        const l = [];
        list.forEach((b => {
            let arr;
            (arr = unionAABB(baseBound, b)).length > 1 ? l.push(b) : baseBound = arr[0];
        })), nextList.push(baseBound), l.length && _merge(l[0], l.slice(1));
    }(boundsList[0], boundsList.slice(1)), nextList;
}
//# sourceMappingURL=aabb.js.map
