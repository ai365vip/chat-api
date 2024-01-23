import { ColorUtil, isNil, interpolateNumber, interpolateDate } from "@visactor/vutils";

const {interpolateRgb: interpolateRgb} = ColorUtil;

export function interpolate(a, b) {
    const t = typeof b;
    let c;
    if (isNil(b) || "boolean" === t) return () => b;
    if ("number" === t) return interpolateNumber(a, b);
    if ("string" === t) {
        if (c = ColorUtil.Color.parseColorString(b)) {
            const rgb = interpolateRgb(ColorUtil.Color.parseColorString(a), c);
            return t => rgb(t).formatRgb();
        }
        return interpolateNumber(Number(a), Number(b));
    }
    return b instanceof ColorUtil.RGB ? interpolateRgb(a, b) : b instanceof ColorUtil.Color ? interpolateRgb(a.color, b.color) : b instanceof Date ? interpolateDate(a, b) : interpolateNumber(Number(a), Number(b));
}
//# sourceMappingURL=interpolate.js.map