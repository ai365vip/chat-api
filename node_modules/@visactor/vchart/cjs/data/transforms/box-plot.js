"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.foldOutlierData = void 0;

const vutils_1 = require("@visactor/vutils"), box_plot_1 = require("../../constant/box-plot"), foldOutlierData = (data, op) => {
    const result = [], {outliersField: outliersField, dimensionField: dimensionField} = op;
    return (data[0].latestData || []).forEach((d => {
        let outlierValues = d[outliersField];
        (0, vutils_1.isArray)(outlierValues) || (outlierValues = [ outlierValues ]), result.push(...outlierValues.map((v => {
            const resData = {
                [box_plot_1.BOX_PLOT_OUTLIER_VALUE_FIELD]: v
            };
            return dimensionField.forEach((field => {
                resData[field] = d[field];
            })), resData;
        })));
    })), result;
};

exports.foldOutlierData = foldOutlierData;
//# sourceMappingURL=box-plot.js.map
