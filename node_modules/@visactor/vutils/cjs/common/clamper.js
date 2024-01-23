"use strict";

function clamper(a, b) {
    let t;
    return a > b && (t = a, a = b, b = t), x => Math.max(a, Math.min(b, x));
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.clamper = void 0, exports.clamper = clamper;
//# sourceMappingURL=clamper.js.map