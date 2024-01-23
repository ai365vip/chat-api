"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.genSegContext = exports.genCurveSegments = void 0;

const vutils_1 = require("@visactor/vutils"), seg_context_1 = require("../seg-context"), enums_1 = require("../enums");

function genCurveSegments(path, points, step = 1) {
    let defined0 = !1;
    for (let i = 0, n = points.length; i <= n; i++) i >= n === defined0 && ((defined0 = !defined0) ? path.lineStart() : path.lineEnd()), 
    defined0 && path.point(points[i]);
}

function genSegContext(curveType, direction, points) {
    const curveDirection = null != direction ? direction : (0, vutils_1.abs)(points[points.length - 1].x - points[0].x) > (0, 
    vutils_1.abs)(points[points.length - 1].y - points[0].y) ? enums_1.Direction.ROW : enums_1.Direction.COLUMN;
    return "monotoneY" === curveType ? new seg_context_1.ReflectSegContext(curveType, curveDirection) : new seg_context_1.SegContext(curveType, curveDirection);
}

exports.genCurveSegments = genCurveSegments, exports.genSegContext = genSegContext;
//# sourceMappingURL=common.js.map
