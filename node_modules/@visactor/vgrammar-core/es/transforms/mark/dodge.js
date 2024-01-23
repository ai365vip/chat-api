import { array, isNil } from "@visactor/vutils";

import { getter, toPercent } from "@visactor/vgrammar-util";

import { getBandWidthOfScale, isBandLikeScale } from "../../util/scale";

export const transform = (options, upstreamData) => {
    var _a, _b, _c;
    if (!upstreamData || 0 === upstreamData.length || !(null === (_a = upstreamData[0]) || void 0 === _a ? void 0 : _a.mark)) return upstreamData;
    const mark = upstreamData[0].mark, markScales = mark.getScales(), bandScale = Object.values(markScales).find(isBandLikeScale);
    if (!bandScale) return upstreamData;
    const scales = mark.getScalesByChannel(), bandWidth = getBandWidthOfScale(bandScale), dodgeChannel = isNil(options.dodgeChannel) ? scales.y === bandScale || scales.y1 === bandScale || scales.x && !isBandLikeScale(scales.x) || scales.x1 && !isBandLikeScale(scales.x1) ? "y" : "x" : options.dodgeChannel;
    if (bandWidth > 0) {
        const innerGap = null !== (_b = options.innerGap) && void 0 !== _b ? _b : 0, categoryGap = null !== (_c = options.categoryGap) && void 0 !== _c ? _c : "20%";
        let getDodgeBy = element => element.groupKey;
        if (!isNil(options.dodgeBy)) {
            const getDodgeValue = getter(array(options.dodgeBy));
            getDodgeBy = element => getDodgeValue(element.getDatum());
        }
        const groupValues = [];
        upstreamData.forEach((element => {
            const groupValue = getDodgeBy(element);
            groupValues.includes(groupValue) || groupValues.push(groupValue);
        }));
        const groupCount = groupValues.length;
        if (groupCount < 1) return upstreamData;
        const catGap = toPercent(categoryGap, bandWidth);
        let innerSize = catGap >= bandWidth ? bandWidth : bandWidth - catGap;
        const innerGapSize = toPercent(innerGap, innerSize);
        let size = (innerSize - Math.max(groupCount - 1, 0) * innerGapSize) / groupCount;
        size > options.maxWidth ? (innerSize -= (size - options.maxWidth) * groupCount, 
        size = options.maxWidth) : size < options.minWidth && options.minWidth <= bandWidth / groupCount && (innerSize += (options.minWidth - size) * groupCount, 
        size = options.minWidth);
        const offsetByGroup = {};
        groupValues.forEach(((entry, index) => {
            offsetByGroup[entry] = -innerSize / 2 + index * (size + innerGapSize);
        }));
        const markType = mark.markType;
        "rect" === markType || "interval" === markType || "arc" === markType ? upstreamData.forEach((element => {
            const groupValue = getDodgeBy(element), offset = offsetByGroup[groupValue], attrs = element.getItemAttribute();
            if ("x" === dodgeChannel) {
                const newAttrs = {
                    x: (isNil(attrs.width) && !isNil(attrs.x1) ? Math.min(attrs.x, attrs.x1) : attrs.x) + (isNil(attrs.width) ? isNil(attrs.x1) ? bandWidth : Math.abs(attrs.x1 - attrs.x) : attrs.width) / 2 + offset
                };
                isNil(attrs.width) ? newAttrs.x1 = newAttrs.x + size : newAttrs.width = size, element.setItemAttributes(newAttrs);
            } else if ("y" === dodgeChannel) {
                const newAttrs = {
                    y: (isNil(attrs.height) && !isNil(attrs.y1) ? Math.min(attrs.y, attrs.y1) : attrs.y) + (isNil(attrs.height) ? isNil(attrs.y1) ? bandWidth : Math.abs(attrs.y1 - attrs.y) : attrs.height) / 2 + offset
                };
                isNil(attrs.height) ? newAttrs.y1 = newAttrs.y + size : newAttrs.height = size, 
                element.setItemAttributes(newAttrs);
            }
        })) : upstreamData.forEach((element => {
            const groupValue = getDodgeBy(element), offset = offsetByGroup[groupValue];
            if ("x" === dodgeChannel) {
                const x = element.getItemAttribute("x") + bandWidth / 2 + offset + size / 2;
                element.setItemAttributes({
                    x: x
                }), "rule" === markType && element.setItemAttributes({
                    x1: x
                });
            } else if ("y" === dodgeChannel) {
                const y = element.getItemAttribute("y") + bandWidth / 2 + offset + size / 2;
                element.setItemAttributes({
                    y: y
                }), "rule" === markType && element.setItemAttributes({
                    y1: y
                });
            }
        }));
    }
    return upstreamData;
};
//# sourceMappingURL=dodge.js.map
