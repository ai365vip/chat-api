import { isArray } from "@visactor/vutils";

import { BOX_PLOT_OUTLIER_VALUE_FIELD } from "../../constant/box-plot";

export const foldOutlierData = (data, op) => {
    const result = [], {outliersField: outliersField, dimensionField: dimensionField} = op;
    return (data[0].latestData || []).forEach((d => {
        let outlierValues = d[outliersField];
        isArray(outlierValues) || (outlierValues = [ outlierValues ]), result.push(...outlierValues.map((v => {
            const resData = {
                [BOX_PLOT_OUTLIER_VALUE_FIELD]: v
            };
            return dimensionField.forEach((field => {
                resData[field] = d[field];
            })), resData;
        })));
    })), result;
};
//# sourceMappingURL=box-plot.js.map
