"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BindingInWhenOnSyntax = void 0;

const binding_in_syntax_1 = require("./binding_in_syntax"), binding_when_syntax_1 = require("./binding_when_syntax");

class BindingInWhenOnSyntax {
    constructor(binding) {
        this._binding = binding, this._bindingWhenSyntax = new binding_when_syntax_1.BindingWhenSyntax(this._binding), 
        this._bindingInSyntax = new binding_in_syntax_1.BindingInSyntax(binding);
    }
    inRequestScope() {
        return this._bindingInSyntax.inRequestScope();
    }
    inSingletonScope() {
        return this._bindingInSyntax.inSingletonScope();
    }
    inTransientScope() {
        return this._bindingInSyntax.inTransientScope();
    }
    whenTargetNamed(name) {
        return this._bindingWhenSyntax.whenTargetNamed(name);
    }
}

exports.BindingInWhenOnSyntax = BindingInWhenOnSyntax;
//# sourceMappingURL=binding_in_when_on_syntax.js.map
