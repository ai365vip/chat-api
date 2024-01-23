import { DiffState } from "@visactor/vgrammar-core";

import { minInArray } from "@visactor/vutils";

export const computeRatio = (angle, range) => {
    const ratio = (angle - range[0]) / (range[1] - range[0] || 1);
    return Math.max(0, Math.min(1, ratio));
};

export const getInnerMostElements = element => {
    const updateElements = element.mark.elements.filter((e => e.diffState === DiffState.update)), minDepth = minInArray(updateElements.map((e => {
        var _a;
        return null === (_a = null == e ? void 0 : e.data) || void 0 === _a ? void 0 : _a[0].depth;
    })));
    return updateElements.filter((e => {
        var _a;
        return (null === (_a = null == e ? void 0 : e.data) || void 0 === _a ? void 0 : _a[0].depth) === minDepth;
    }));
};
//# sourceMappingURL=utils.js.map
