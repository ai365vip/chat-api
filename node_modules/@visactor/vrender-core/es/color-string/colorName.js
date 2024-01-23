import { DEFAULT_COLORS } from "@visactor/vutils";

const parsedColors = {};

Object.keys(DEFAULT_COLORS).forEach((k => {
    const c = DEFAULT_COLORS[k];
    parsedColors[k] = [ c >> 16 & 255, c >> 8 & 255, 255 & c ];
}));

export default parsedColors;
//# sourceMappingURL=colorName.js.map