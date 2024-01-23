import { BaseSeriesTooltipHelper } from "../base/tooltip-helper";

import { array, isValid } from "@visactor/vutils";

export class AreaSeriesTooltipHelper extends BaseSeriesTooltipHelper {
    constructor() {
        super(...arguments), this._getSeriesStyle = (datum, styleKey, defaultValue) => {
            var _a, _b, _c, _d;
            for (const key of array(styleKey)) {
                let value = null === (_a = this.series.getSeriesStyle(datum)) || void 0 === _a ? void 0 : _a(key);
                if (!1 !== value || "fill" !== key && "stroke" !== key || (value = "fill" === key ? null === (_c = null === (_b = this.series.getSeriesStyle(datum)) || void 0 === _b ? void 0 : _b("stroke")) || void 0 === _c ? void 0 : _c[0] : null === (_d = this.series.getSeriesStyle(datum)) || void 0 === _d ? void 0 : _d("fill")), 
                isValid(value)) return value;
            }
            return defaultValue;
        };
    }
}
//# sourceMappingURL=tooltip-helpter.js.map
