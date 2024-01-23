"use strict";

function computeOffsetForlimit(shape, bounds) {
    const {x1: regionMinX, y1: regionMinY, x2: regionMaxX, y2: regionMaxY} = bounds, {x1: x1, y1: y1, x2: x2, y2: y2} = shape.AABBBounds;
    let dx = 0, dy = 0;
    return x1 < regionMinX && (dx = regionMinX - x1), y1 < regionMinY && (dy = regionMinY - y1), 
    x2 > regionMaxX && (dx = regionMaxX - x2), y2 > regionMaxY && (dy = regionMaxY - y2), 
    {
        dx: dx,
        dy: dy
    };
}

function limitShapeInBounds(shape, bounds) {
    const {dx: dx, dy: dy} = computeOffsetForlimit(shape, bounds), {dx: originDx = 0, dy: originDy = 0} = shape.attribute;
    dx && shape.setAttribute("dx", dx + originDx), dy && shape.setAttribute("dy", dy + originDy);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.limitShapeInBounds = exports.computeOffsetForlimit = void 0, exports.computeOffsetForlimit = computeOffsetForlimit, 
exports.limitShapeInBounds = limitShapeInBounds;
//# sourceMappingURL=limit-shape.js.map
