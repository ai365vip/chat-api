"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.SeriesData = void 0;

const vutils_1 = require("@visactor/vutils"), compilable_data_1 = require("../../compile/data/compilable-data");

class SeriesData extends compilable_data_1.CompilableData {
    _compileProduct() {
        var _a;
        const data = null === (_a = this._data) || void 0 === _a ? void 0 : _a.latestData;
        (0, vutils_1.isNil)(data) || (0, vutils_1.isValid)(this.getProduct()) || this._initProduct([]);
    }
    generateProductId() {
        var _a;
        return null === (_a = this._data) || void 0 === _a ? void 0 : _a.name;
    }
}

exports.SeriesData = SeriesData;
//# sourceMappingURL=series-data.js.map
