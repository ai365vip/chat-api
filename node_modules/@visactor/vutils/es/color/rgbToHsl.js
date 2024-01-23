export default function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const cMin = Math.min(r, g, b), cMax = Math.max(r, g, b), delta = cMax - cMin;
    let h = 0, s = 0, l = 0;
    return h = 0 === delta ? 0 : cMax === r ? (g - b) / delta % 6 : cMax === g ? (b - r) / delta + 2 : (r - g) / delta + 4, 
    h = Math.round(60 * h), h < 0 && (h += 360), l = (cMax + cMin) / 2, s = 0 === delta ? 0 : delta / (1 - Math.abs(2 * l - 1)), 
    s = +(100 * s).toFixed(1), l = +(100 * l).toFixed(1), {
        h: h,
        s: s,
        l: l
    };
}
//# sourceMappingURL=rgbToHsl.js.map