"use strict";

function isHorizontal(direction) {
    return "horizontal" === direction;
}

function isVertical(direction) {
    return "vertical" === direction;
}

function isValidDirection(direction) {
    return "vertical" === direction || "horizontal" === direction;
}

function isValidPosition(position) {
    return "top" === position || "bottom" === position || "left" === position || "right" === position;
}

function isHorizontalPosition(position) {
    return "top" === position || "bottom" === position;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isHorizontalPosition = exports.isValidPosition = exports.isValidDirection = exports.isVertical = exports.isHorizontal = void 0, 
exports.isHorizontal = isHorizontal, exports.isVertical = isVertical, exports.isValidDirection = isValidDirection, 
exports.isValidPosition = isValidPosition, exports.isHorizontalPosition = isHorizontalPosition;
//# sourceMappingURL=direction.js.map