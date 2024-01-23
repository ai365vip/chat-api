"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getInnerMostElements = exports.computeRatio = void 0;

const vgrammar_core_1 = require("@visactor/vgrammar-core"), vutils_1 = require("@visactor/vutils"), computeRatio = (angle, range) => {
    const ratio = (angle - range[0]) / (range[1] - range[0] || 1);
    return Math.max(0, Math.min(1, ratio));
};

exports.computeRatio = computeRatio;

const getInnerMostElements = element => {
    const updateElements = element.mark.elements.filter((e => e.diffState === vgrammar_core_1.DiffState.update)), minDepth = (0, 
    vutils_1.minInArray)(updateElements.map((e => {
        var _a;
        return null === (_a = null == e ? void 0 : e.data) || void 0 === _a ? void 0 : _a[0].depth;
    })));
    return updateElements.filter((e => {
        var _a;
        return (null === (_a = null == e ? void 0 : e.data) || void 0 === _a ? void 0 : _a[0].depth) === minDepth;
    }));
};

exports.getInnerMostElements = getInnerMostElements;
//# sourceMappingURL=utils.js.map
