import { isNil, isValidNumber, bisect, quantileSorted, ascending, arrayEqual } from "@visactor/vutils";

import { ScaleEnum } from "./type";

export class QuantileScale {
    constructor() {
        this.type = ScaleEnum.Quantile, this._range = [], this._domain = [], this._thresholds = [];
    }
    unknown(_) {
        return arguments.length ? (this._unknown = _, this) : this._unknown;
    }
    rescale(slience) {
        if (slience) return this;
        let i = 0;
        const n = Math.max(1, this._range.length);
        for (this._thresholds = new Array(n - 1); ++i < n; ) this._thresholds[i - 1] = quantileSorted(this._domain, i / n);
        return this;
    }
    scale(x) {
        return isValidNumber(x) ? this._range[bisect(this._thresholds, x)] : this._unknown;
    }
    invertExtent(y) {
        const i = this._range.indexOf(y);
        return i < 0 ? [ NaN, NaN ] : [ i > 0 ? this._thresholds[i - 1] : this._domain[0], i < this._thresholds.length ? this._thresholds[i] : this._domain[this._domain.length - 1] ];
    }
    quantiles() {
        return this._thresholds.slice();
    }
    domain(_, slience) {
        if (!_) return this._domain.slice();
        this._domain = [];
        for (const value of _) isNil(value) || Number.isNaN(+value) || this._domain.push(+value);
        return this._domain.sort(ascending), this.rescale(slience);
    }
    range(_, slience) {
        if (!_) return this._range.slice();
        const nextRange = Array.from(_);
        return arrayEqual(this._range, nextRange) ? this : (this._range = nextRange, this.rescale(slience));
    }
    clone() {
        return (new QuantileScale).domain(this._domain, !0).range(this._range).unknown(this._unknown);
    }
}
//# sourceMappingURL=quantile-scale.js.map