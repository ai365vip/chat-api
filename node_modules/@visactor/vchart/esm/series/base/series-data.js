import { isNil, isValid } from "@visactor/vutils";

import { CompilableData } from "../../compile/data/compilable-data";

export class SeriesData extends CompilableData {
    _compileProduct() {
        var _a;
        const data = null === (_a = this._data) || void 0 === _a ? void 0 : _a.latestData;
        isNil(data) || isValid(this.getProduct()) || this._initProduct([]);
    }
    generateProductId() {
        var _a;
        return null === (_a = this._data) || void 0 === _a ? void 0 : _a.name;
    }
}
//# sourceMappingURL=series-data.js.map
