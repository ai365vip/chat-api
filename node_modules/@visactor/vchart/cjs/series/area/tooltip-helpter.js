"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.AreaSeriesTooltipHelper = void 0;

const tooltip_helper_1 = require("../base/tooltip-helper"), vutils_1 = require("@visactor/vutils");

class AreaSeriesTooltipHelper extends tooltip_helper_1.BaseSeriesTooltipHelper {
    constructor() {
        super(...arguments), this._getSeriesStyle = (datum, styleKey, defaultValue) => {
            var _a, _b, _c, _d;
            for (const key of (0, vutils_1.array)(styleKey)) {
                let value = null === (_a = this.series.getSeriesStyle(datum)) || void 0 === _a ? void 0 : _a(key);
                if (!1 !== value || "fill" !== key && "stroke" !== key || (value = "fill" === key ? null === (_c = null === (_b = this.series.getSeriesStyle(datum)) || void 0 === _b ? void 0 : _b("stroke")) || void 0 === _c ? void 0 : _c[0] : null === (_d = this.series.getSeriesStyle(datum)) || void 0 === _d ? void 0 : _d("fill")), 
                (0, vutils_1.isValid)(value)) return value;
            }
            return defaultValue;
        };
    }
}

exports.AreaSeriesTooltipHelper = AreaSeriesTooltipHelper;
//# sourceMappingURL=tooltip-helpter.js.map
