"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.PointScale = void 0;

const type_1 = require("./type"), band_scale_1 = require("./band-scale");

class PointScale extends band_scale_1.BandScale {
    constructor(slience) {
        super(!1), this.type = type_1.ScaleEnum.Point, this._padding = 0, this.paddingInner(1, slience), 
        this.padding = this.paddingOuter, this.paddingInner = void 0, this.paddingOuter = void 0;
    }
}

exports.PointScale = PointScale;
//# sourceMappingURL=point-scale.js.map