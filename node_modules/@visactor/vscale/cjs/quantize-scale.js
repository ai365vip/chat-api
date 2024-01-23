"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.QuantizeScale = void 0;

const vutils_1 = require("@visactor/vutils"), type_1 = require("./type"), tick_sample_1 = require("./utils/tick-sample");

class QuantizeScale {
    constructor() {
        this.type = type_1.ScaleEnum.Quantile, this._range = [ 0, 1 ], this._domain = [ .5 ], 
        this.x0 = 0, this.x1 = 1, this.n = 1;
    }
    unknown(_) {
        return arguments.length ? (this._unknown = _, this) : this._unknown;
    }
    rescale(slience) {
        if (slience) return this;
        let i = -1;
        for (this._domain = new Array(this.n); ++i < this.n; ) this._domain[i] = ((i + 1) * this.x1 - (i - this.n) * this.x0) / (this.n + 1);
        return this;
    }
    scale(x) {
        return (0, vutils_1.isValidNumber)(x) ? this._range[(0, vutils_1.bisect)(this._domain, x, 0, this.n)] : this._unknown;
    }
    invertExtent(y) {
        const i = this._range.indexOf(y);
        return i < 0 ? [ NaN, NaN ] : i < 1 ? [ this.x0, this._domain[0] ] : i >= this.n ? [ this._domain[this.n - 1], this.x1 ] : [ this._domain[i - 1], this._domain[i] ];
    }
    thresholds() {
        return this._domain.slice();
    }
    domain(_, slience) {
        if (!_) return [ this.x0, this.x1 ];
        const domain = Array.from(_);
        return this.x0 = +domain[0], this.x1 = +domain[1], this.rescale(slience);
    }
    range(_, slience) {
        if (!_) return this._range.slice();
        const nextRange = Array.from(_);
        return (0, vutils_1.arrayEqual)(this._range, nextRange) ? this : (this.n = nextRange.length - 1, 
        this._range = nextRange, this.rescale(slience));
    }
    clone() {
        return (new QuantizeScale).domain([ this.x0, this.x1 ], !0).range(this._range).unknown(this._unknown);
    }
    ticks(count = 10) {
        const d = this.domain();
        return (0, tick_sample_1.ticks)(d[0], d[d.length - 1], count);
    }
    forceTicks(count = 10) {
        const d = this.domain();
        return (0, tick_sample_1.forceTicks)(d[0], d[d.length - 1], count);
    }
    stepTicks(step) {
        const d = this.domain();
        return (0, tick_sample_1.stepTicks)(d[0], d[d.length - 1], step);
    }
    nice(count = 10) {
        const niceDomain = (0, tick_sample_1.niceLinear)(this.domain(), count);
        return niceDomain ? this.domain(niceDomain) : this;
    }
    niceMin(count = 10) {
        const maxD = this._domain[this._domain.length - 1], niceDomain = (0, tick_sample_1.niceLinear)(this.domain(), count);
        return niceDomain && (niceDomain[niceDomain.length - 1] = maxD, this.domain(niceDomain)), 
        this;
    }
    niceMax(count = 10) {
        const minD = this._domain[0], niceDomain = (0, tick_sample_1.niceLinear)(this.domain(), count);
        return niceDomain && (niceDomain[0] = minD, this.domain(niceDomain)), this;
    }
}

exports.QuantizeScale = QuantizeScale;
//# sourceMappingURL=quantize-scale.js.map