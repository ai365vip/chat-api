"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.PowScale = void 0;

const linear_scale_1 = require("./linear-scale"), type_1 = require("./type"), utils_1 = require("./utils/utils");

class PowScale extends linear_scale_1.LinearScale {
    constructor() {
        super(), this.type = type_1.ScaleEnum.Pow, this._exponent = 1;
    }
    clone() {
        return (new PowScale).domain(this._domain, !0).range(this._range, !0).unknown(this._unknown).clamp(this.clamp(), null, !0).interpolate(this._interpolate, !0).exponent(this._exponent);
    }
    rescale(slience) {
        return slience || (1 === this._exponent ? (this.transformer = utils_1.identity, 
        this.untransformer = utils_1.identity) : .5 === this._exponent ? (this.transformer = utils_1.sqrt, 
        this.untransformer = utils_1.square) : (this.transformer = (0, utils_1.generatePow)(this._exponent), 
        this.untransformer = (0, utils_1.generatePow)(1 / this._exponent)), super.rescale()), 
        this;
    }
    exponent(_, slience) {
        return arguments.length ? (this._exponent = _, this.rescale(slience)) : this._exponent;
    }
}

exports.PowScale = PowScale;
//# sourceMappingURL=pow-scale.js.map