import { computeRatio, getInnerMostElements } from "./utils";

import { isEmpty, maxInArray, minInArray } from "@visactor/vutils";

const computeInnerAngleRange = (elements, startAngle, endAngle) => {
    if (isEmpty(elements)) return [ startAngle, endAngle ];
    return [ minInArray(elements.map((m => 1 * m.getGraphicAttribute("startAngle", !1)))), maxInArray(elements.map((m => 1 * m.getGraphicAttribute("endAngle", !1)))) ];
};

export const sunburstEnter = params => ({
    channel: {
        startAngle: {
            from: (d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = getInnerMostElements(element), angleRange = computeInnerAngleRange(innerElements, startAngle, endAngle);
                return computeRatio(d.startAngle, angleRange) * (endAngle - startAngle) + startAngle;
            },
            to: d => d.startAngle
        },
        endAngle: {
            from: (d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = getInnerMostElements(element), angleRange = computeInnerAngleRange(innerElements, startAngle, endAngle);
                return computeRatio(d.endAngle, angleRange) * (endAngle - startAngle) + startAngle;
            },
            to: d => d.endAngle
        },
        outerRadius: {
            from: d => d.innerRadius,
            to: d => d.outerRadius
        },
        innerRadius: {
            from: d => d.innerRadius,
            to: d => d.innerRadius
        }
    }
});
//# sourceMappingURL=enter.js.map
