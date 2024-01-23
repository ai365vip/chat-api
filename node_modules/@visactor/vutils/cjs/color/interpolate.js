"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.interpolateRgb = void 0;

const Color_1 = require("./Color");

function interpolateRgb(colorA, colorB) {
    const redA = colorA.r, redB = colorB.r, greenA = colorA.g, greenB = colorB.g, blueA = colorA.b, blueB = colorB.b, opacityA = colorA.opacity, opacityB = colorB.opacity;
    return t => {
        const r = Math.round(redA * (1 - t) + redB * t), g = Math.round(greenA * (1 - t) + greenB * t), b = Math.round(blueA * (1 - t) + blueB * t), opacity = opacityA * (1 - t) + opacityB * t;
        return new Color_1.RGB(r, g, b, opacity);
    };
}

exports.interpolateRgb = interpolateRgb;
//# sourceMappingURL=interpolate.js.map