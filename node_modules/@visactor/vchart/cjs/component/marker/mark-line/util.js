"use strict";

function getInsertPoints(start, end, direction, offset = 0) {
    const points = [], dy = start.y - end.y, dx = start.x - end.x;
    switch (direction) {
      case "top":
        points.push(start), points.push({
            x: start.x,
            y: dy > 0 ? start.y - offset - Math.abs(dy) : start.y - offset
        }), points.push({
            x: end.x,
            y: dy > 0 ? end.y - offset : end.y - offset - Math.abs(dy)
        }), points.push(end);
        break;

      case "bottom":
        points.push(start), points.push({
            x: start.x,
            y: dy < 0 ? start.y + offset + Math.abs(dy) : start.y + offset
        }), points.push({
            x: end.x,
            y: dy < 0 ? end.y + offset : end.y + offset + Math.abs(dy)
        }), points.push(end);
        break;

      case "left":
        points.push(start), points.push({
            x: dx > 0 ? start.x - offset - Math.abs(dx) : start.x - offset,
            y: start.y
        }), points.push({
            x: dx > 0 ? end.x - offset : end.x - offset - Math.abs(dx),
            y: end.y
        }), points.push(end);
        break;

      case "right":
        points.push(start), points.push({
            x: dx > 0 ? start.x + offset : start.x + offset + Math.abs(dx),
            y: start.y
        }), points.push({
            x: dx > 0 ? end.x + offset + Math.abs(dx) : end.x + offset,
            y: end.y
        }), points.push(end);
    }
    return points;
}

function getTextOffset(start, end, direction, offset = 0) {
    const dy = start.y - end.y, dx = start.x - end.x;
    return "bottom" === direction ? {
        dx: dx > 0 ? -dx / 2 : Math.abs(dx / 2),
        dy: dy > 0 ? offset : Math.abs(dy) + offset
    } : "top" === direction ? {
        dx: dx > 0 ? -Math.abs(dx / 2) : +Math.abs(dx / 2),
        dy: dy > 0 ? -(Math.abs(dy) + offset) : -offset
    } : "left" === direction ? {
        dx: dx > 0 ? -dx - offset : -offset,
        dy: dy > 0 ? -dy / 2 : Math.abs(dy / 2)
    } : "right" === direction ? {
        dx: dx > 0 ? offset : Math.abs(dx) + offset,
        dy: dy > 0 ? -dy / 2 : Math.abs(dy / 2)
    } : {};
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getTextOffset = exports.getInsertPoints = void 0, exports.getInsertPoints = getInsertPoints, 
exports.getTextOffset = getTextOffset;
//# sourceMappingURL=util.js.map
