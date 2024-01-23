"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transformPadding = void 0;

const vutils_1 = require("@visactor/vutils");

function transformPadding(padding) {
    if ((0, vutils_1.isNumber)(padding)) return padding;
    return [ padding.top ? padding.top : 0, padding.right ? padding.right : 0, padding.bottom ? padding.bottom : 0, padding.left ? padding.left : 0 ];
}

exports.transformPadding = transformPadding;
//# sourceMappingURL=utils.js.map
