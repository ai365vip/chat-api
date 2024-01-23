import { genCurveSegments, genSegContext } from "./common";

import { Linear } from "./linear";

export class LinearClosed extends Linear {
    lineEnd() {
        this.context.closePath();
    }
}

export function genLinearClosedSegments(points, params = {}) {
    const {direction: direction, startPoint: startPoint} = params;
    if (points.length < 2 - Number(!!startPoint)) return null;
    const segContext = genSegContext("linear", direction, points);
    return genLinearClosedTypeSegments(new LinearClosed(segContext, startPoint), points), 
    segContext;
}

export function genLinearClosedTypeSegments(path, points) {
    return genCurveSegments(path, points, 1);
}
//# sourceMappingURL=linear-closed.js.map
