"use strict";

function variance(values, valueof) {
    let delta, count = 0, mean = 0, sum = 0;
    if (void 0 === valueof) for (let value of values) null != value && (value = +value) >= value && (delta = value - mean, 
    mean += delta / ++count, sum += delta * (value - mean)); else {
        let index = -1;
        for (let value of values) null != (value = valueof(value, ++index, values)) && (value = +value) >= value && (delta = value - mean, 
        mean += delta / ++count, sum += delta * (value - mean));
    }
    return count > 1 ? sum / (count - 1) : 0;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.variance = void 0, exports.variance = variance;
//# sourceMappingURL=variance.js.map
