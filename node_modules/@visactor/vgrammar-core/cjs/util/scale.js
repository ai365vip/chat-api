"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getScaleRangeRatio = exports.getBandWidthOfScale = exports.isBandLikeScale = void 0;

const vscale_1 = require("@visactor/vscale");

function isBandLikeScale(scale) {
    return scale && (scale.type === vscale_1.ScaleEnum.Band || scale.type === vscale_1.ScaleEnum.Point);
}

function getBandWidthOfScale(scale) {
    if (scale) return scale.type === vscale_1.ScaleEnum.Band ? scale.bandwidth() : scale.type === vscale_1.ScaleEnum.Point ? scale.step() : void 0;
}

function getScaleRangeRatio(scale, input) {
    const range = scale.range();
    return (scale.scale(input) - range[0]) / (range[range.length - 1] - range[0]);
}

exports.isBandLikeScale = isBandLikeScale, exports.getBandWidthOfScale = getBandWidthOfScale, 
exports.getScaleRangeRatio = getScaleRangeRatio;
//# sourceMappingURL=scale.js.map
