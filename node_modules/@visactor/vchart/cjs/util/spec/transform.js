"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.functionTransform = exports.specTransform = void 0;

const vutils_1 = require("@visactor/vutils");

function specTransform(spec, special = {
    data: v => v
}) {
    if (!spec) return spec;
    if (spec.constructor === Object) {
        const result = {};
        for (const key in spec) if (Object.prototype.hasOwnProperty.call(spec, key)) {
            if (special[key]) {
                result[key] = special[key](spec[key]);
                continue;
            }
            result[key] = specTransform(spec[key], special);
        }
        return result;
    }
    return (0, vutils_1.isArray)(spec) ? spec.map((s => specTransform(s, special))) : spec;
}

function functionTransform(spec, VChart) {
    if (!spec) return spec;
    if ((0, vutils_1.isPlainObject)(spec)) {
        const result = {};
        for (const key in spec) if (Object.prototype.hasOwnProperty.call(spec, key)) {
            if ((0, vutils_1.isString)(spec[key]) && VChart.getFunction(spec[key])) {
                result[key] = VChart.getFunction(spec[key]);
                continue;
            }
            result[key] = functionTransform(spec[key], VChart);
        }
        return result;
    }
    return (0, vutils_1.isArray)(spec) ? spec.map((s => functionTransform(s, VChart))) : spec;
}

exports.specTransform = specTransform, exports.functionTransform = functionTransform;
//# sourceMappingURL=transform.js.map
