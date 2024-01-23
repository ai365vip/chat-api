import { computeRatio, getInnerMostElements } from "./utils";

import { maxInArray, minInArray } from "@visactor/vutils";

const computeInnerAngleRange = elements => [ minInArray(elements.map((m => 1 * m.getGraphicAttribute("startAngle", !1)))), maxInArray(elements.map((m => 1 * m.getGraphicAttribute("endAngle", !1)))) ];

export const sunburstExit = params => ({
    channel: {
        startAngle: {
            from: (_d, element) => element.getGraphicAttribute("startAngle", !1),
            to: (_d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = getInnerMostElements(element), range = computeInnerAngleRange(innerElements);
                return computeRatio(element.getGraphicAttribute("startAngle", !1), range) * (endAngle - startAngle) + startAngle;
            }
        },
        endAngle: {
            from: (_d, element) => element.getGraphicAttribute("endAngle", !1),
            to: (_d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = getInnerMostElements(element), range = computeInnerAngleRange(innerElements);
                return computeRatio(element.getGraphicAttribute("endAngle", !1), range) * (endAngle - startAngle) + startAngle;
            }
        },
        outerRadius: {
            from: (_d, element) => element.getGraphicAttribute("outerRadius", !1),
            to: () => params.animationInfo().innerRadius
        },
        innerRadius: {
            from: (_d, element) => element.getGraphicAttribute("innerRadius", !1),
            to: () => params.animationInfo().innerRadius
        }
    }
});
//# sourceMappingURL=exit.js.map
