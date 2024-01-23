"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CompilableSignal = void 0;

const grammar_item_1 = require("../grammar-item"), type_1 = require("../../util/type"), compilable_item_1 = require("../interface/compilable-item");

class CompilableSignal extends grammar_item_1.GrammarItem {
    getValue() {
        return this._value;
    }
    getUpdateFunc() {
        return this._updateFunc;
    }
    constructor(option, name, value, updateFunc) {
        super(option), this.grammarType = compilable_item_1.GrammarType.signal, this.name = name, 
        this._value = value, this._updateFunc = updateFunc;
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
        (0, type_1.isValid)(this._value) && this._product.value(this._value), (0, type_1.isValid)(this._updateFunc) && this._product.update(this._updateFunc);
    }
    generateProductId() {
        return this.name;
    }
    _lookupGrammar(id) {
        var _a;
        return null === (_a = this.getCompiler().getVGrammarView()) || void 0 === _a ? void 0 : _a.getSignalById(id);
    }
}

exports.CompilableSignal = CompilableSignal;
//# sourceMappingURL=compilable-signal.js.map
