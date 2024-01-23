"use strict";

function hexToRgb(str) {
    let r = "", g = "", b = "";
    const strtIndex = "#" === str[0] ? 1 : 0;
    for (let i = strtIndex; i < str.length; i++) "#" !== str[i] && (i < strtIndex + 2 ? r += str[i] : i < strtIndex + 4 ? g += str[i] : i < strtIndex + 6 && (b += str[i]));
    return [ parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) ];
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = hexToRgb;
//# sourceMappingURL=hexToRgb.js.map