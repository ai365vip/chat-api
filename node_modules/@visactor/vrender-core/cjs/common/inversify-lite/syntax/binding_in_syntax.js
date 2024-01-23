"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BindingInSyntax = void 0;

const literal_types_1 = require("../constants/literal_types"), binding_when_on_syntax_1 = require("./binding_when_on_syntax");

class BindingInSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    inRequestScope() {
        return this._binding.scope = literal_types_1.BindingScopeEnum.Request, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    inSingletonScope() {
        return this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    inTransientScope() {
        return this._binding.scope = literal_types_1.BindingScopeEnum.Transient, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
}

exports.BindingInSyntax = BindingInSyntax;
//# sourceMappingURL=binding_in_syntax.js.map
