"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isDimensionInfo = exports.isMarkInfo = void 0;

const vutils_1 = require("@visactor/vutils"), isMarkInfo = info => (0, vutils_1.isValid)(info) && !(0, 
vutils_1.isArray)(info);

exports.isMarkInfo = isMarkInfo;

const isDimensionInfo = info => (0, vutils_1.isValid)(info) && (0, vutils_1.isArray)(info);

exports.isDimensionInfo = isDimensionInfo;
//# sourceMappingURL=util.js.map
