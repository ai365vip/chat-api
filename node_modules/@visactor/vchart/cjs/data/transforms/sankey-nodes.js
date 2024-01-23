"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.sankeyNodes = void 0;

const vutils_1 = require("@visactor/vutils"), sankeyNodes = data => {
    var _a, _b;
    return data && (0, vutils_1.isArray)(data) && (null === (_a = data[0]) || void 0 === _a ? void 0 : _a.latestData) && data[0].latestData.length && data[0].latestData[0] && null !== (_b = data[0].latestData[0].nodes) && void 0 !== _b ? _b : [];
};

exports.sankeyNodes = sankeyNodes;
//# sourceMappingURL=sankey-nodes.js.map
