"use strict";

function getSizeHandlerPath(align = "bottom") {
    let centerX = 0;
    return "top" === align ? `\n    M${centerX},-6L${centerX - 3.5},-2.5\n    v5\n    h7\n    v-5\n    Z\n` : "left" === align ? (centerX = 1, 
    `\n    M${centerX - 6},0L${centerX - 6 + 2.5},-3.5\n    h5\n    v7\n    h-5\n    Z\n`) : "right" === align ? (centerX = -1, 
    `\n    M${centerX + 6},0L${centerX + 6 - 2.5},-3.5\n    h-5\n    v7\n    h5\n    Z\n  `) : `\n    M${centerX},6L${centerX - 3.5},2.5\n    v-5\n    h7\n    v5\n    Z\n`;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getSizeHandlerPath = void 0, exports.getSizeHandlerPath = getSizeHandlerPath;
//# sourceMappingURL=util.js.map
