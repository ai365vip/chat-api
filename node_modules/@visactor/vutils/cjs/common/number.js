"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isLess = exports.isGreater = exports.isNumberClose = void 0;

const DEFAULT_ABSOLUTE_TOLERATE = 1e-10, DEFAULT_RELATIVE_TOLERATE = 1e-10;

function isNumberClose(a, b, relTol = DEFAULT_RELATIVE_TOLERATE, absTol = DEFAULT_ABSOLUTE_TOLERATE) {
    const abs = absTol, rel = relTol * Math.max(a, b);
    return Math.abs(a - b) <= Math.max(abs, rel);
}

function isGreater(a, b, relTol, absTol) {
    return a > b && !isNumberClose(a, b, relTol, absTol);
}

function isLess(a, b, relTol, absTol) {
    return a < b && !isNumberClose(a, b, relTol, absTol);
}

exports.isNumberClose = isNumberClose, exports.isGreater = isGreater, exports.isLess = isLess;
//# sourceMappingURL=number.js.map
