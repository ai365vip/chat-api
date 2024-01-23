"use strict";

function hslToRgb(h, s, l) {
    s /= 100, l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    return 0 <= h && h < 60 ? (r = c, g = x, b = 0) : 60 <= h && h < 120 ? (r = x, g = c, 
    b = 0) : 120 <= h && h < 180 ? (r = 0, g = c, b = x) : 180 <= h && h < 240 ? (r = 0, 
    g = x, b = c) : 240 <= h && h < 300 ? (r = x, g = 0, b = c) : 300 <= h && h < 360 && (r = c, 
    g = 0, b = x), r = Math.round(255 * (r + m)), g = Math.round(255 * (g + m)), b = Math.round(255 * (b + m)), 
    {
        r: r,
        g: g,
        b: b
    };
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = hslToRgb;
//# sourceMappingURL=hslToRgb.js.map