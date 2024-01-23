"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.normalizeRectAttributes = void 0;

const vutils_1 = require("@visactor/vutils"), normalizeRectAttributes = attribute => {
    if (!attribute) return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    let width = (0, vutils_1.isNil)(attribute.width) ? attribute.x1 - attribute.x : attribute.width, height = (0, 
    vutils_1.isNil)(attribute.height) ? attribute.y1 - attribute.y : attribute.height, x = 0, y = 0;
    return width < 0 ? (x = width, width = -width) : Number.isNaN(width) && (width = 0), 
    height < 0 ? (y = height, height = -height) : Number.isNaN(height) && (height = 0), 
    {
        x: x,
        y: y,
        width: width,
        height: height
    };
};

exports.normalizeRectAttributes = normalizeRectAttributes;
//# sourceMappingURL=rect-utils.js.map