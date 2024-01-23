import { RGB } from "./Color";

export function interpolateRgb(colorA, colorB) {
    const redA = colorA.r, redB = colorB.r, greenA = colorA.g, greenB = colorB.g, blueA = colorA.b, blueB = colorB.b, opacityA = colorA.opacity, opacityB = colorB.opacity;
    return t => {
        const r = Math.round(redA * (1 - t) + redB * t), g = Math.round(greenA * (1 - t) + greenB * t), b = Math.round(blueA * (1 - t) + blueB * t);
        return new RGB(r, g, b, opacityA * (1 - t) + opacityB * t);
    };
}
//# sourceMappingURL=interpolate.js.map