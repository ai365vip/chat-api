"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.toPercent = void 0;

const vutils_1 = require("@visactor/vutils"), toPercent = (percent, total) => (0, 
vutils_1.isNil)(percent) ? total : (0, vutils_1.isString)(percent) ? total * parseFloat(percent) / 100 : percent;

exports.toPercent = toPercent;
//# sourceMappingURL=toPercent.js.map