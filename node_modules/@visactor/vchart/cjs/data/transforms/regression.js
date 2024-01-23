"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.markerRegression = void 0;

const math_1 = require("../../util/math");

function markerRegression(_data, opt) {
    const data = _data[0].latestData;
    return (0, math_1.regression)(data, opt.fieldX, opt.fieldY);
}

exports.markerRegression = markerRegression;
//# sourceMappingURL=regression.js.map
