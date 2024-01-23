"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.sunburstEnter = void 0;

const utils_1 = require("./utils"), vutils_1 = require("@visactor/vutils"), computeInnerAngleRange = (elements, startAngle, endAngle) => {
    if ((0, vutils_1.isEmpty)(elements)) return [ startAngle, endAngle ];
    return [ (0, vutils_1.minInArray)(elements.map((m => 1 * m.getGraphicAttribute("startAngle", !1)))), (0, 
    vutils_1.maxInArray)(elements.map((m => 1 * m.getGraphicAttribute("endAngle", !1)))) ];
}, sunburstEnter = params => ({
    channel: {
        startAngle: {
            from: (d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = (0, 
                utils_1.getInnerMostElements)(element), angleRange = computeInnerAngleRange(innerElements, startAngle, endAngle);
                return (0, utils_1.computeRatio)(d.startAngle, angleRange) * (endAngle - startAngle) + startAngle;
            },
            to: d => d.startAngle
        },
        endAngle: {
            from: (d, element) => {
                const {startAngle: startAngle, endAngle: endAngle} = params.animationInfo(), innerElements = (0, 
                utils_1.getInnerMostElements)(element), angleRange = computeInnerAngleRange(innerElements, startAngle, endAngle);
                return (0, utils_1.computeRatio)(d.endAngle, angleRange) * (endAngle - startAngle) + startAngle;
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

exports.sunburstEnter = sunburstEnter;
//# sourceMappingURL=enter.js.map
