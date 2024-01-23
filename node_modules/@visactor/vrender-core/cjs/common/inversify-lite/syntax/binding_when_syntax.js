"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BindingWhenSyntax = void 0;

const binding_on_syntax_1 = require("./binding_on_syntax"), constraint_helpers_1 = require("./constraint_helpers");

class BindingWhenSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    whenTargetNamed(name) {
        return this._binding.constraint = (0, constraint_helpers_1.namedConstraint)(name), 
        new binding_on_syntax_1.BindingOnSyntax(this._binding);
    }
}

exports.BindingWhenSyntax = BindingWhenSyntax;
//# sourceMappingURL=binding_when_syntax.js.map
