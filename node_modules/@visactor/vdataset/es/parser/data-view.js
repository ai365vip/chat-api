import { isBoolean, isArray } from "@visactor/vutils";

export const dataViewParser = (data, options, dataView) => {
    const dependencyUpdate = !isBoolean(null == options ? void 0 : options.dependencyUpdate) || (null == options ? void 0 : options.dependencyUpdate);
    if (!data || !isArray(data)) throw new TypeError("Invalid data: must be DataView array!");
    return isArray(dataView.rawData) && dataView.rawData.forEach((rd => {
        rd.target && (rd.target.removeListener("change", dataView.reRunAllTransform), rd.target.removeListener("markRunning", dataView.markRunning));
    })), dependencyUpdate && data.forEach((d => {
        d.target.addListener("change", dataView.reRunAllTransform), d.target.addListener("markRunning", dataView.markRunning);
    })), data;
};
//# sourceMappingURL=data-view.js.map