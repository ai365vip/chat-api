"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isArrayLike = function(value) {
    return null !== value && "function" != typeof value && Number.isFinite(value.length);
};

exports.default = isArrayLike;
//# sourceMappingURL=isArrayLike.js.map