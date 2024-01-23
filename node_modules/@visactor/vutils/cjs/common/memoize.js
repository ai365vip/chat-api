"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.memoize = void 0;

const memoize = func => {
    let lastArgs = null, lastResult = null;
    return (...args) => (lastArgs && args.every(((val, i) => val === lastArgs[i])) || (lastArgs = args, 
    lastResult = func(...args)), lastResult);
};

exports.memoize = memoize;
//# sourceMappingURL=memoize.js.map
