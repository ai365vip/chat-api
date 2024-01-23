"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pointBetweenLine = exports.pointInLine = exports.pointInOBB = exports.getOBBFromLine = void 0;

const math_1 = require("../../math");

let dirX, dirY, normalX, normalY, len, lineWidthDiv2, width, height;

function getOBBFromLine(point1, point2, lineWidth) {
    dirX = point2.x - point1.x, dirY = point2.y - point1.y, normalX = dirY, normalY = -dirX, 
    width = len = Math.sqrt(normalX * normalX + normalY * normalY), height = lineWidth, 
    normalX /= len, normalY /= len, lineWidthDiv2 = lineWidth / 2, dirX = lineWidthDiv2 * normalX, 
    dirY = lineWidthDiv2 * normalY;
    return {
        point1: {
            x: point1.x + dirX,
            y: point1.y + dirY
        },
        point2: {
            x: point1.x - dirX,
            y: point1.y - dirY
        },
        point3: {
            x: point2.x + dirX,
            y: point2.y + dirY
        },
        point4: {
            x: point2.x - dirX,
            y: point2.y - dirY
        },
        width: width,
        height: height,
        left: Math.min(point1.x, point2.x) - Math.abs(dirX),
        top: Math.min(point1.y, point2.y) - Math.abs(dirY)
    };
}

exports.getOBBFromLine = getOBBFromLine;

const point1 = {
    x: 0,
    y: 0
}, point2 = {
    x: 0,
    y: 0
};

function pointInOBB(point, obb) {
    return point1.x = (obb.point1.x + obb.point2.x) / 2, point1.y = (obb.point1.y + obb.point2.y) / 2, 
    point2.x = (obb.point3.x + obb.point4.x) / 2, point2.y = (obb.point3.y + obb.point4.y) / 2, 
    pointInLine(point, point1, point2, obb.height);
}

function pointInLine(point, point1, point2, lineWidth) {
    return (0, math_1.lengthFromPointToLine)(point, point1, point2) <= lineWidth / 2 && pointBetweenLine(point, point1, point2);
}

exports.pointInOBB = pointInOBB, exports.pointInLine = pointInLine;

const dir1 = {
    x: 0,
    y: 0
}, dir2 = {
    x: 0,
    y: 0
}, normal = {
    x: 0,
    y: 0
};

function pointBetweenLine(point, point1, point2) {
    return dir1.x = point1.x - point.x, dir1.y = point1.y - point.y, dir2.x = point2.x - point.x, 
    dir2.y = point2.y - point.y, normal.x = point1.y - point2.y, normal.y = point2.x - point1.x, 
    (0, math_1.crossProductPoint)(dir1, normal) * (0, math_1.crossProductPoint)(dir2, normal) < 0;
}

exports.pointBetweenLine = pointBetweenLine;
//# sourceMappingURL=obb.js.map
