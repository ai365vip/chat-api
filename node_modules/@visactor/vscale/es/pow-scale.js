import { LinearScale } from "./linear-scale";

import { ScaleEnum } from "./type";

import { identity, sqrt, square, generatePow } from "./utils/utils";

export class PowScale extends LinearScale {
    constructor() {
        super(), this.type = ScaleEnum.Pow, this._exponent = 1;
    }
    clone() {
        return (new PowScale).domain(this._domain, !0).range(this._range, !0).unknown(this._unknown).clamp(this.clamp(), null, !0).interpolate(this._interpolate, !0).exponent(this._exponent);
    }
    rescale(slience) {
        return slience || (1 === this._exponent ? (this.transformer = identity, this.untransformer = identity) : .5 === this._exponent ? (this.transformer = sqrt, 
        this.untransformer = square) : (this.transformer = generatePow(this._exponent), 
        this.untransformer = generatePow(1 / this._exponent)), super.rescale()), this;
    }
    exponent(_, slience) {
        return arguments.length ? (this._exponent = _, this.rescale(slience)) : this._exponent;
    }
}
//# sourceMappingURL=pow-scale.js.map