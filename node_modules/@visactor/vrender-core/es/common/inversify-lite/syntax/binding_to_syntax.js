import * as ERROR_MSGS from "../constants/error_msgs";

import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";

import { BindingInWhenOnSyntax } from "./binding_in_when_on_syntax";

import { BindingWhenOnSyntax } from "./binding_when_on_syntax";

class BindingToSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    to(constructor) {
        return this._binding.type = BindingTypeEnum.Instance, this._binding.implementationType = constructor, 
        new BindingInWhenOnSyntax(this._binding);
    }
    toSelf() {
        if ("function" != typeof this._binding.serviceIdentifier) throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        const self = this._binding.serviceIdentifier;
        return this.to(self);
    }
    toConstantValue(value) {
        return this._binding.type = BindingTypeEnum.ConstantValue, this._binding.cache = value, 
        this._binding.dynamicValue = null, this._binding.implementationType = null, this._binding.scope = BindingScopeEnum.Singleton, 
        new BindingWhenOnSyntax(this._binding);
    }
    toDynamicValue(func) {
        return this._binding.type = BindingTypeEnum.DynamicValue, this._binding.cache = null, 
        this._binding.dynamicValue = func, this._binding.implementationType = null, new BindingInWhenOnSyntax(this._binding);
    }
    toConstructor(constructor) {
        return this._binding.type = BindingTypeEnum.Constructor, this._binding.implementationType = constructor, 
        this._binding.scope = BindingScopeEnum.Singleton, new BindingWhenOnSyntax(this._binding);
    }
    toFactory(factory) {
        return this._binding.type = BindingTypeEnum.Factory, this._binding.factory = factory, 
        this._binding.scope = BindingScopeEnum.Singleton, new BindingWhenOnSyntax(this._binding);
    }
    toFunction(func) {
        if ("function" != typeof func) throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING);
        const bindingWhenOnSyntax = this.toConstantValue(func);
        return this._binding.type = BindingTypeEnum.Function, this._binding.scope = BindingScopeEnum.Singleton, 
        bindingWhenOnSyntax;
    }
    toAutoFactory(serviceIdentifier) {
        return this._binding.type = BindingTypeEnum.Factory, this._binding.factory = context => () => context.container.get(serviceIdentifier), 
        this._binding.scope = BindingScopeEnum.Singleton, new BindingWhenOnSyntax(this._binding);
    }
    toAutoNamedFactory(serviceIdentifier) {
        return this._binding.type = BindingTypeEnum.Factory, this._binding.factory = context => named => context.container.getNamed(serviceIdentifier, named), 
        new BindingWhenOnSyntax(this._binding);
    }
    toProvider(provider) {
        return this._binding.type = BindingTypeEnum.Provider, this._binding.provider = provider, 
        this._binding.scope = BindingScopeEnum.Singleton, new BindingWhenOnSyntax(this._binding);
    }
    toService(service) {
        this.toDynamicValue((context => context.container.get(service)));
    }
}

export { BindingToSyntax };
//# sourceMappingURL=binding_to_syntax.js.map
