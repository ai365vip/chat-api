import { isArray, isPlainObject, isString } from "@visactor/vutils";

export function specTransform(spec, special = {
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
    return isArray(spec) ? spec.map((s => specTransform(s, special))) : spec;
}

export function functionTransform(spec, VChart) {
    if (!spec) return spec;
    if (isPlainObject(spec)) {
        const result = {};
        for (const key in spec) if (Object.prototype.hasOwnProperty.call(spec, key)) {
            if (isString(spec[key]) && VChart.getFunction(spec[key])) {
                result[key] = VChart.getFunction(spec[key]);
                continue;
            }
            result[key] = functionTransform(spec[key], VChart);
        }
        return result;
    }
    return isArray(spec) ? spec.map((s => functionTransform(s, VChart))) : spec;
}
//# sourceMappingURL=transform.js.map
