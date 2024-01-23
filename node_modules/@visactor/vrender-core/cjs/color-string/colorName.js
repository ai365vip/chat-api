"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const vutils_1 = require("@visactor/vutils"), parsedColors = {};

Object.keys(vutils_1.DEFAULT_COLORS).forEach((k => {
    const c = vutils_1.DEFAULT_COLORS[k];
    parsedColors[k] = [ c >> 16 & 255, c >> 8 & 255, 255 & c ];
})), exports.default = parsedColors;
//# sourceMappingURL=colorName.js.map