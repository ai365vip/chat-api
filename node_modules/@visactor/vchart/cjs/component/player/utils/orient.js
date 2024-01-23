"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isHorizontal = exports.isVertical = void 0;

const isVertical = orient => "left" === orient || "right" === orient;

exports.isVertical = isVertical;

const isHorizontal = orient => "top" === orient || "bottom" === orient;

exports.isHorizontal = isHorizontal;
//# sourceMappingURL=orient.js.map
