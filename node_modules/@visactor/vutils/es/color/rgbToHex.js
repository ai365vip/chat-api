export default function rgbToHex(r, g, b) {
    return Number((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
//# sourceMappingURL=rgbToHex.js.map