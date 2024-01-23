import { BindingScopeEnum, BindingTypeEnum } from "../literal_types";

import { BindingInSyntax } from "./binding_in_syntax";

class BindingToSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    to(constructor) {
        return this._binding.type = BindingTypeEnum.Instance, this._binding.implementationType = constructor, 
        new BindingInSyntax(this._binding);
    }
    toSelf() {
        const self = this._binding.serviceIdentifier;
        return this.to(self);
    }
    toDynamicValue(func) {
        return this._binding.type = BindingTypeEnum.DynamicValue, this._binding.cache = null, 
        this._binding.dynamicValue = func, this._binding.implementationType = null, new BindingInSyntax(this._binding);
    }
    toConstantValue(value) {
        return this._binding.type = BindingTypeEnum.ConstantValue, this._binding.cache = value, 
        this._binding.dynamicValue = null, this._binding.implementationType = null, this._binding.scope = BindingScopeEnum.Singleton, 
        new BindingInSyntax(this._binding);
    }
    toFactory(factory) {
        return this._binding.type = BindingTypeEnum.Factory, this._binding.factory = factory, 
        this._binding.scope = BindingScopeEnum.Singleton, new BindingInSyntax(this._binding);
    }
    toService(service) {
        this.toDynamicValue((context => context.container.get(service)));
    }
}

export { BindingToSyntax };
//# sourceMappingURL=binding_to_syntax.js.map
