"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const clamp = function(input, min, max) {
    return input < min ? min : input > max ? max : input;
};

exports.default = clamp;
//# sourceMappingURL=clamp.js.map