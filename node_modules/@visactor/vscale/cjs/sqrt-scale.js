"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.SqrtScale = void 0;

const utils_1 = require("./utils/utils"), linear_scale_1 = require("./linear-scale"), type_1 = require("./type");

class SqrtScale extends linear_scale_1.LinearScale {
    constructor() {
        super(utils_1.sqrt, utils_1.square), this.type = type_1.ScaleEnum.Sqrt;
    }
    clone() {
        return (new SqrtScale).domain(this._domain, !0).range(this._range, !0).unknown(this._unknown).clamp(this.clamp(), null, !0).interpolate(this._interpolate);
    }
}

exports.SqrtScale = SqrtScale;
//# sourceMappingURL=sqrt-scale.js.map