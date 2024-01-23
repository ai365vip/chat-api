import { isFunction } from "@visactor/vutils";

import { dimensionStatistics } from "./dimension-statistics";

import { flatten } from "./flatten";

export const hierarchyDimensionStatistics = (data, op) => {
    let result = {}, fields = op.fields;
    if (isFunction(fields) && (fields = fields()), !(null == fields ? void 0 : fields.length) || !(null == data ? void 0 : data.length)) return result;
    if (!data[0].latestData) return result;
    const hierarchyData = data[0].latestData, flatData = flatten(hierarchyData);
    return result = dimensionStatistics([ {
        latestData: flatData
    } ], op), result;
};
//# sourceMappingURL=hierarchy-dimension-statistics.js.map
