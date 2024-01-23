"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.deviation = void 0;

const variance_1 = require("./variance");

function deviation(values, valueof) {
    const v = (0, variance_1.variance)(values, valueof);
    return v ? Math.sqrt(v) : v;
}

exports.deviation = deviation;
//# sourceMappingURL=deviation.js.map