"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.interpolate = void 0;

const vutils_1 = require("@visactor/vutils"), {interpolateRgb: interpolateRgb} = vutils_1.ColorUtil;

function interpolate(a, b) {
    const t = typeof b;
    let c;
    if ((0, vutils_1.isNil)(b) || "boolean" === t) return () => b;
    if ("number" === t) return (0, vutils_1.interpolateNumber)(a, b);
    if ("string" === t) {
        if (c = vutils_1.ColorUtil.Color.parseColorString(b)) {
            const rgb = interpolateRgb(vutils_1.ColorUtil.Color.parseColorString(a), c);
            return t => rgb(t).formatRgb();
        }
        return (0, vutils_1.interpolateNumber)(Number(a), Number(b));
    }
    return b instanceof vutils_1.ColorUtil.RGB ? interpolateRgb(a, b) : b instanceof vutils_1.ColorUtil.Color ? interpolateRgb(a.color, b.color) : b instanceof Date ? (0, 
    vutils_1.interpolateDate)(a, b) : (0, vutils_1.interpolateNumber)(Number(a), Number(b));
}

exports.interpolate = interpolate;
//# sourceMappingURL=interpolate.js.map