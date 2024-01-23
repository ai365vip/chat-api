"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.hierarchyDimensionStatistics = void 0;

const vutils_1 = require("@visactor/vutils"), dimension_statistics_1 = require("./dimension-statistics"), flatten_1 = require("./flatten"), hierarchyDimensionStatistics = (data, op) => {
    let result = {}, fields = op.fields;
    if ((0, vutils_1.isFunction)(fields) && (fields = fields()), !(null == fields ? void 0 : fields.length) || !(null == data ? void 0 : data.length)) return result;
    if (!data[0].latestData) return result;
    const hierarchyData = data[0].latestData, flatData = (0, flatten_1.flatten)(hierarchyData);
    return result = (0, dimension_statistics_1.dimensionStatistics)([ {
        latestData: flatData
    } ], op), result;
};

exports.hierarchyDimensionStatistics = hierarchyDimensionStatistics;
//# sourceMappingURL=hierarchy-dimension-statistics.js.map
