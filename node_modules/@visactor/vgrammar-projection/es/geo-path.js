import { identity, field as getFieldAccessor } from "@visactor/vgrammar-util";

import { isNil } from "@visactor/vutils";

import { getProjectionPath } from "./projections";

function initPath(path, pointRadius) {
    const prev = path.pointRadius();
    return path.context(null), isNil(pointRadius) || path.pointRadius(pointRadius), 
    prev;
}

export const transform = (options, upstreamData) => {
    const field = isNil(options.field) ? identity : getFieldAccessor(options.field), as = options.as, path = getProjectionPath(options.projection), prev = initPath(path, options.pointRadius);
    let output = upstreamData;
    return isNil(as) ? output = upstreamData.map((entry => path(field(entry)))) : upstreamData.forEach((entry => {
        entry[as] = path(field(entry));
    })), path.pointRadius(prev), output;
};