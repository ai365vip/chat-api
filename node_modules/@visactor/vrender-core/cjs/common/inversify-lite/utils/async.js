"use strict";

function isPromise(object) {
    return ("object" == typeof object && null !== object || "function" == typeof object) && "function" == typeof object.then;
}

function isPromiseOrContainsPromise(object) {
    return !!isPromise(object) || Array.isArray(object) && object.some(isPromise);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isPromiseOrContainsPromise = exports.isPromise = void 0, exports.isPromise = isPromise, 
exports.isPromiseOrContainsPromise = isPromiseOrContainsPromise;
//# sourceMappingURL=async.js.map
