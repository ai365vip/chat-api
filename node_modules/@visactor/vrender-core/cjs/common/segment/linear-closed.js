"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.genLinearClosedTypeSegments = exports.genLinearClosedSegments = exports.LinearClosed = void 0;

const common_1 = require("./common"), linear_1 = require("./linear");

class LinearClosed extends linear_1.Linear {
    lineEnd() {
        this.context.closePath();
    }
}

function genLinearClosedSegments(points, params = {}) {
    const {direction: direction, startPoint: startPoint} = params;
    if (points.length < 2 - Number(!!startPoint)) return null;
    const segContext = (0, common_1.genSegContext)("linear", direction, points);
    return genLinearClosedTypeSegments(new LinearClosed(segContext, startPoint), points), 
    segContext;
}

function genLinearClosedTypeSegments(path, points) {
    return (0, common_1.genCurveSegments)(path, points, 1);
}

exports.LinearClosed = LinearClosed, exports.genLinearClosedSegments = genLinearClosedSegments, 
exports.genLinearClosedTypeSegments = genLinearClosedTypeSegments;
//# sourceMappingURL=linear-closed.js.map
