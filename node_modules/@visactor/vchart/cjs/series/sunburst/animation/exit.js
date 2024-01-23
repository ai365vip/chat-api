"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.sunburstExit = void 0;

const utils_1 = require("./utils"), vutils_1 = require("@visactor/vutils"), computeInnerAngleRange = elements => [ (0, 
vutils_1.minInArray)(elements.map((m => 1 * m.getGraphicAttribute("startAngle", !1)))), (0, 
vutils_1.maxInArray)(elements.map((m => 1 * m.getGraphicAttribute("endAngle", !1)))) ], sunburstExit = params => ({
    channel: {
        startAngle: {
            from: (_d, element) => element.getGraphicAttribute("startAngle", !1),
            to: (_d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = (0, 
                utils_1.getInnerMostElements)(element), range = computeInnerAngleRange(innerElements);
                return (0, utils_1.computeRatio)(element.getGraphicAttribute("startAngle", !1), range) * (endAngle - startAngle) + startAngle;
            }
        },
        endAngle: {
            from: (_d, element) => element.getGraphicAttribute("endAngle", !1),
            to: (_d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = (0, 
                utils_1.getInnerMostElements)(element), range = computeInnerAngleRange(innerElements);
                return (0, utils_1.computeRatio)(element.getGraphicAttribute("endAngle", !1), range) * (endAngle - startAngle) + startAngle;
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

exports.sunburstExit = sunburstExit;
//# sourceMappingURL=exit.js.map
