import { GrammarItem } from "../grammar-item";

import { isValid } from "../../util/type";

import { GrammarType } from "../interface/compilable-item";

export class CompilableSignal extends GrammarItem {
    getValue() {
        return this._value;
    }
    getUpdateFunc() {
        return this._updateFunc;
    }
    constructor(option, name, value, updateFunc) {
        super(option), this.grammarType = GrammarType.signal, this.name = name, this._value = value, 
        this._updateFunc = updateFunc;
    }
    updateSignal(value, updateFunc) {
        this._value = value, this._updateFunc = updateFunc, this.compile();
    }
    _compileProduct() {
        const view = this.getVGrammarView();
        if (!view) return;
        if (!this.getProduct()) {
            const id = this.getProductId();
            this._product = view.signal().id(id), this._compiledProductId = id;
        }
        isValid(this._value) && this._product.value(this._value), isValid(this._updateFunc) && this._product.update(this._updateFunc);
    }
    generateProductId() {
        return this.name;
    }
    _lookupGrammar(id) {
        var _a;
        return null === (_a = this.getCompiler().getVGrammarView()) || void 0 === _a ? void 0 : _a.getSignalById(id);
    }
}
//# sourceMappingURL=compilable-signal.js.map
