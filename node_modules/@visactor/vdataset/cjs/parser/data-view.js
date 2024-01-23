"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.dataViewParser = void 0;

const vutils_1 = require("@visactor/vutils"), dataViewParser = (data, options, dataView) => {
    const dependencyUpdate = !(0, vutils_1.isBoolean)(null == options ? void 0 : options.dependencyUpdate) || (null == options ? void 0 : options.dependencyUpdate);
    if (!data || !(0, vutils_1.isArray)(data)) throw new TypeError("Invalid data: must be DataView array!");
    return (0, vutils_1.isArray)(dataView.rawData) && dataView.rawData.forEach((rd => {
        rd.target && (rd.target.removeListener("change", dataView.reRunAllTransform), rd.target.removeListener("markRunning", dataView.markRunning));
    })), dependencyUpdate && data.forEach((d => {
        d.target.addListener("change", dataView.reRunAllTransform), d.target.addListener("markRunning", dataView.markRunning);
    })), data;
};

exports.dataViewParser = dataViewParser;
//# sourceMappingURL=data-view.js.map