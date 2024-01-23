"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BindingInSyntax = void 0;

const literal_types_1 = require("../literal_types"), constraint_helpers_1 = require("./constraint_helpers");

class BindingInSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    inRequestScope() {
        throw new Error("暂未实现");
    }
    inSingletonScope() {
        return this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, this;
    }
    inTransientScope() {
        return this._binding.scope = literal_types_1.BindingScopeEnum.Transient, this;
    }
    whenTargetNamed(name) {
        return this._binding.constraint = (0, constraint_helpers_1.namedConstraint)(name), 
        this;
    }
}

exports.BindingInSyntax = BindingInSyntax;
//# sourceMappingURL=binding_in_syntax.js.map
