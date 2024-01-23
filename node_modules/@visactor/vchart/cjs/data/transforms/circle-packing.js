"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.circlePackingLayout = void 0;

const vgrammar_hierarchy_1 = require("@visactor/vgrammar-hierarchy"), circlePackingLayout = (data, op) => {
    if (!data) return data;
    const options = op(), {width: width, height: height} = options;
    if (0 === width || 0 === height) return data;
    return new vgrammar_hierarchy_1.CirclePackingLayout(options).layout(data, {
        width: width,
        height: height
    });
};

exports.circlePackingLayout = circlePackingLayout;
//# sourceMappingURL=circle-packing.js.map
