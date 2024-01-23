import { ScaleEnum } from "@visactor/vscale";

export function isBandLikeScale(scale) {
    return scale && (scale.type === ScaleEnum.Band || scale.type === ScaleEnum.Point);
}

export function getBandWidthOfScale(scale) {
    if (scale) return scale.type === ScaleEnum.Band ? scale.bandwidth() : scale.type === ScaleEnum.Point ? scale.step() : void 0;
}

export function getScaleRangeRatio(scale, input) {
    const range = scale.range();
    return (scale.scale(input) - range[0]) / (range[range.length - 1] - range[0]);
}
//# sourceMappingURL=scale.js.map
