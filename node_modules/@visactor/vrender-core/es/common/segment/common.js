import { abs } from "@visactor/vutils";

import { ReflectSegContext, SegContext } from "../seg-context";

import { Direction } from "../enums";

export function genCurveSegments(path, points, step = 1) {
    let defined0 = !1;
    for (let i = 0, n = points.length; i <= n; i++) i >= n === defined0 && ((defined0 = !defined0) ? path.lineStart() : path.lineEnd()), 
    defined0 && path.point(points[i]);
}

export function genSegContext(curveType, direction, points) {
    const curveDirection = null != direction ? direction : abs(points[points.length - 1].x - points[0].x) > abs(points[points.length - 1].y - points[0].y) ? Direction.ROW : Direction.COLUMN;
    return "monotoneY" === curveType ? new ReflectSegContext(curveType, curveDirection) : new SegContext(curveType, curveDirection);
}
//# sourceMappingURL=common.js.map
