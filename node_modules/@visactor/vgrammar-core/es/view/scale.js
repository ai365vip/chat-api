import { isNil } from "@visactor/vutils";

import { supportRangeFactor } from "@visactor/vscale";

import { GrammarBase } from "./grammar-base";

import { configureScale, createScale, parseScaleConfig, parseScaleDomainRange } from "../parse/scale";

import { HOOK_EVENT } from "../graph/enums";

import { Factory } from "../core/factory";

export class Scale extends GrammarBase {
    constructor(view, scaleType) {
        super(view), this.grammarType = "scale", this.spec.type = scaleType, this.scale = createScale(scaleType);
    }
    parse(spec) {
        return super.parse(spec), this.domain(spec.domain), this.range(spec.range), this.configure(spec), 
        this.commit(), this;
    }
    evaluate(upstream, parameters) {
        return this.view.emit(HOOK_EVENT.BEFORE_EVALUATE_SCALE), this.spec.type || (this.spec.type = "linear"), 
        this.scale && this.scale.type === this.spec.type || (this.scale = createScale(this.spec.type)), 
        configureScale(this.spec, this.scale, parameters), this.scale && supportRangeFactor(this.scale.type) && (this._rangeFactor ? this.scale.rangeFactor(this._rangeFactor) : this.scale.rangeFactor() && this.scale.rangeFactor(null, !1, !0), 
        this._fishEyeOptions ? this.scale.fishEye(this._fishEyeOptions) : this.scale.fishEye() && this.scale.fishEye(null, !1, !0)), 
        this.view.emit(HOOK_EVENT.BEFORE_EVALUATE_SCALE), this;
    }
    output() {
        return this.scale;
    }
    getScaleType() {
        return this.spec.type;
    }
    getScale() {
        return this.scale;
    }
    ticks(count) {
        var _a, _b, _c;
        return null !== (_c = null === (_b = null === (_a = this.scale) || void 0 === _a ? void 0 : _a.tickData) || void 0 === _b ? void 0 : _b.call(_a, count)) && void 0 !== _c ? _c : [];
    }
    domain(domain) {
        return isNil(this.spec.domain) || this.detach(parseScaleDomainRange(this.spec.domain, this.view)), 
        this.spec.domain = domain, this.attach(parseScaleDomainRange(domain, this.view)), 
        this.commit(), this;
    }
    range(range) {
        return isNil(this.spec.range) || this.detach(parseScaleDomainRange(this.spec.range, this.view)), 
        this.spec.range = range, this.attach(parseScaleDomainRange(range, this.view)), this.commit(), 
        this;
    }
    tickCount(tickCount) {
        return this.setFunctionSpec(tickCount, "tickCount");
    }
    setRangeFactor(range) {
        return this._rangeFactor = range, this;
    }
    getRangeFactor() {
        return this._rangeFactor;
    }
    setFishEye(fishEyeOptions) {
        return this._fishEyeOptions = fishEyeOptions, this;
    }
    getFishEye() {
        return this._fishEyeOptions;
    }
    getCoordinateAxisPosition() {
        const rangeSpec = this.spec.range, coord = null == rangeSpec ? void 0 : rangeSpec.coordinate;
        if (!isNil(coord)) {
            const dim = rangeSpec.dimension, isSub = rangeSpec.isSubshaft, reversed = rangeSpec.reversed, coordinate = this.parameters()[coord];
            return null == coordinate ? void 0 : coordinate.getVisualPositionByDimension(dim, isSub, reversed);
        }
        return null;
    }
    getCoordinateAxisPoints(baseValue) {
        const rangeSpec = this.spec.range, coord = null == rangeSpec ? void 0 : rangeSpec.coordinate;
        if (!isNil(coord)) {
            const dim = rangeSpec.dimension, isSub = rangeSpec.isSubshaft, reversed = rangeSpec.reversed, coordinate = this.parameters()[coord];
            return null == coordinate ? void 0 : coordinate.getAxisPointsByDimension(dim, isSub, reversed, baseValue);
        }
        return null;
    }
    getCoordinate() {
        const rangeSpec = this.spec.range, coord = null == rangeSpec ? void 0 : rangeSpec.coordinate;
        return isNil(coord) ? null : this.parameters()[coord];
    }
    configure(config) {
        return this.detach(parseScaleConfig(this.spec.type, config, this.view)), isNil(config) ? this.spec = {
            type: this.spec.type,
            domain: this.spec.domain,
            range: this.spec.range
        } : (Object.assign(this.spec, config), this.attach(parseScaleConfig(this.spec.type, config, this.view))), 
        this.commit(), this;
    }
    reuse(grammar) {
        return grammar.grammarType !== this.grammarType || (this.scale = grammar.output()), 
        this;
    }
    clear() {
        super.clear(), this.scale = null;
    }
}

export const registerScale = () => {
    Factory.registerGrammar("scale", Scale, "scales");
};
//# sourceMappingURL=scale.js.map
