"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BindingWhenOnSyntax = void 0;

const binding_when_syntax_1 = require("./binding_when_syntax");

class BindingWhenOnSyntax {
    constructor(binding) {
        this._binding = binding, this._bindingWhenSyntax = new binding_when_syntax_1.BindingWhenSyntax(this._binding);
    }
    whenTargetNamed(name) {
        return this._bindingWhenSyntax.whenTargetNamed(name);
    }
}

exports.BindingWhenOnSyntax = BindingWhenOnSyntax;
//# sourceMappingURL=binding_when_on_syntax.js.map
