"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.sunburstLayout = void 0;

const vgrammar_hierarchy_1 = require("@visactor/vgrammar-hierarchy"), sunburstLayout = (data, op) => {
    if (!data) return data;
    const options = op(), {width: width, height: height} = options;
    return new vgrammar_hierarchy_1.SunburstLayout(options).layout(data, {
        width: width,
        height: height
    });
};

exports.sunburstLayout = sunburstLayout;
//# sourceMappingURL=sunburst.js.map
