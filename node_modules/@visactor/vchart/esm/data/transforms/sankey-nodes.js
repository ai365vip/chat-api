import { isArray } from "@visactor/vutils";

export const sankeyNodes = data => {
    var _a, _b;
    return data && isArray(data) && (null === (_a = data[0]) || void 0 === _a ? void 0 : _a.latestData) && data[0].latestData.length && data[0].latestData[0] && null !== (_b = data[0].latestData[0].nodes) && void 0 !== _b ? _b : [];
};
//# sourceMappingURL=sankey-nodes.js.map
