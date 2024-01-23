import { isArray, isNil } from "@visactor/vutils";

import { GrammarBase } from "./grammar-base";

import { invokeFunctionType } from "../parse/util";

export class Signal extends GrammarBase {
    constructor() {
        super(...arguments), this.grammarType = "signal", this.spec = {
            value: null,
            update: null
        };
    }
    parse(spec) {
        return super.parse(spec), this.value(spec.value), this.update(spec.update), this.commit(), 
        this;
    }
    evaluate(upstream, parameters) {
        return this._signal = this.spec.update ? invokeFunctionType(this.spec.update, parameters, this._signal) : this.spec.value, 
        this.spec.value = this._signal, this;
    }
    output() {
        return this._signal;
    }
    getValue() {
        return this.output();
    }
    set(value) {
        if (isArray(value) && isArray(this.value) && value.length === this.value.length) {
            for (let i = 0; i < value.length; i++) if (this.value[i] !== value[i]) return this._signal = value, 
            this.spec.value = value, !0;
            return !1;
        }
        return this._signal !== value && (this._signal = value, this.spec.value = value, 
        !0);
    }
    update(update) {
        return isNil(update) || this.value(void 0), this.setFunctionSpec(update, "update");
    }
    value(value) {
        return isNil(value) || this.update(void 0), this.spec.value = value, this.commit(), 
        this;
    }
    reuse(grammar) {
        return grammar.grammarType !== this.grammarType || (this._signal = grammar.output()), 
        this;
    }
    clear() {
        super.clear(), this._signal = null;
    }
}
//# sourceMappingURL=signal.js.map
