"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BindingToSyntax = void 0;

const literal_types_1 = require("../literal_types"), binding_in_syntax_1 = require("./binding_in_syntax");

class BindingToSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    to(constructor) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Instance, this._binding.implementationType = constructor, 
        new binding_in_syntax_1.BindingInSyntax(this._binding);
    }
    toSelf() {
        const self = this._binding.serviceIdentifier;
        return this.to(self);
    }
    toDynamicValue(func) {
        return this._binding.type = literal_types_1.BindingTypeEnum.DynamicValue, this._binding.cache = null, 
        this._binding.dynamicValue = func, this._binding.implementationType = null, new binding_in_syntax_1.BindingInSyntax(this._binding);
    }
    toConstantValue(value) {
        return this._binding.type = literal_types_1.BindingTypeEnum.ConstantValue, this._binding.cache = value, 
        this._binding.dynamicValue = null, this._binding.implementationType = null, this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, 
        new binding_in_syntax_1.BindingInSyntax(this._binding);
    }
    toFactory(factory) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Factory, this._binding.factory = factory, 
        this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, new binding_in_syntax_1.BindingInSyntax(this._binding);
    }
    toService(service) {
        this.toDynamicValue((context => context.container.get(service)));
    }
}

exports.BindingToSyntax = BindingToSyntax;
//# sourceMappingURL=binding_to_syntax.js.map
