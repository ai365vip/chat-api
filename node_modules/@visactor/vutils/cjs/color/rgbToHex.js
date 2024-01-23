"use strict";

function rgbToHex(r, g, b) {
    return Number((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = rgbToHex;
//# sourceMappingURL=rgbToHex.js.map